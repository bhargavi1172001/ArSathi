import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
import openai
import os
from typing import List, Dict

class MedicalRAG:
    def __init__(self):
        self.client = chromadb.Client(Settings(
            anonymized_telemetry=False,
            allow_reset=True
        ))
        
        self.collection = self.client.get_or_create_collection(
            name="medical_knowledge",
            metadata={"description": "Medical information database"}
        )
        
        self.embedder = SentenceTransformer('all-MiniLM-L6-v2')
        self._initialize_knowledge_base()
    
    def _initialize_knowledge_base(self):
        medical_knowledge = [
            {
                "id": "fever_1",
                "text": "Fever is a temporary increase in body temperature, often due to an illness. Normal body temperature is around 98.6°F (37°C). A fever is generally considered when temperature is above 100.4°F (38°C). Common causes include viral infections, bacterial infections, heat exhaustion, and certain inflammatory conditions.",
                "category": "symptoms",
                "severity": "low-medium"
            },
            {
                "id": "chest_pain",
                "text": "Chest pain can have many causes. URGENT: Seek immediate medical attention if chest pain is accompanied by shortness of breath, pain radiating to arm/jaw/back, sweating, nausea, or feeling of pressure. These may indicate heart attack.",
                "category": "symptoms",
                "severity": "high"
            },
            {
                "id": "emergency_signs",
                "text": "Seek IMMEDIATE medical attention for: Chest pain/pressure, difficulty breathing, severe bleeding, loss of consciousness, severe allergic reaction, stroke symptoms (face drooping, arm weakness, speech difficulty), severe head injury, poisoning, seizures lasting >5 minutes.",
                "category": "emergency",
                "severity": "high"
            }
        ]
        
        for doc in medical_knowledge:
            self.collection.add(
                documents=[doc["text"]],
                metadatas=[{"category": doc["category"], "severity": doc["severity"]}],
                ids=[doc["id"]]
            )
        
        print(f"✅ Initialized knowledge base with {len(medical_knowledge)} documents")
    
    def retrieve_relevant_context(self, query: str, n_results: int = 3) -> List[Dict]:
        results = self.collection.query(
            query_texts=[query],
            n_results=n_results
        )
        
        context_docs = []
        if results['documents'] and results['documents'][0]:
            for i, doc in enumerate(results['documents'][0]):
                context_docs.append({
                    "text": doc,
                    "metadata": results['metadatas'][0][i] if results['metadatas'] else {},
                    "distance": results['distances'][0][i] if results['distances'] else None
                })
        
        return context_docs
    
    def generate_response_with_context(self, user_query: str, conversation_history: List = None) -> Dict:
        context_docs = self.retrieve_relevant_context(user_query)
        
        context_str = "\n\n".join([
            f"Medical Knowledge {i+1}:\n{doc['text']}"
            for i, doc in enumerate(context_docs)
        ])
        
        system_prompt = f"""You are Arogya Sathi, a compassionate AI health assistant for rural India.

RETRIEVED MEDICAL KNOWLEDGE:
{context_str}

GUIDELINES:
- Use the retrieved medical knowledge to inform your responses
- Provide empathetic, evidence-based health guidance
- Use simple, culturally appropriate language
- Always include safety disclaimers for serious symptoms
- Never diagnose - only provide general health information
- Encourage professional consultation for concerning symptoms

Remember: You're a guide to help people make informed decisions, not a replacement for doctors."""

        messages = [{"role": "system", "content": system_prompt}]
        
        if conversation_history:
            messages.extend(conversation_history)
        
        messages.append({"role": "user", "content": user_query})
        
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            temperature=0.7,
            max_tokens=500
        )
        
        ai_response = response.choices[0].message.content
        severity_level = self._assess_severity(context_docs, user_query, ai_response)
        
        return {
            "response": ai_response,
            "severity": severity_level,
            "context_used": [doc['text'][:100] + "..." for doc in context_docs],
            "sources": len(context_docs)
        }
    
    def _assess_severity(self, context_docs: List[Dict], query: str, response: str) -> str:
        high_risk_keywords = [
            'chest pain', 'difficulty breathing', 'severe bleeding', 'unconscious',
            'seizure', 'stroke', 'heart attack', 'severe headache'
        ]
        
        combined_text = (query + " " + response).lower()
        
        for doc in context_docs:
            if doc.get('metadata', {}).get('severity') == 'high':
                if any(keyword in combined_text for keyword in high_risk_keywords):
                    return "high"
        
        if any(keyword in combined_text for keyword in high_risk_keywords):
            return "high"
        
        return "low"

_rag_system = None

def get_rag_system():
    global _rag_system
    if _rag_system is None:
        _rag_system = MedicalRAG()
    return _rag_system
