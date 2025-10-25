import React, { useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';
import { LanguageContext } from '../context/LanguageContext';

const HomeScreen = ({ navigation }) => {
  const { language, setLanguage, translations } = useContext(LanguageContext);

  const features = [
    {
      id: 1,
      title: translations[language].symptomCheck,
      icon: '🩺',
      screen: 'Chat',
      description: translations[language].symptomCheckDesc,
    },
    {
      id: 2,
      title: translations[language].findPHC,
      icon: '🏥',
      screen: 'PHCFinder',
      description: translations[language].findPHCDesc,
    },
    {
      id: 3,
      title: translations[language].emergencyHelp,
      icon: '🚑',
      screen: 'Emergency',
      description: translations[language].emergencyHelpDesc,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>🌿 Arogya Sathi</Text>
        <Text style={styles.tagline}>{translations[language].tagline}</Text>
      </View>

      <View style={styles.languageSelector}>
        <Text style={styles.languageLabel}>
          {translations[language].selectLanguage}:
        </Text>
        <View style={styles.languageButtons}>
          {['en', 'hi', 'ta', 'te', 'bn'].map((lang) => (
            <TouchableOpacity
              key={lang}
              style={[
                styles.langButton,
                language === lang && styles.langButtonActive,
              ]}
              onPress={() => setLanguage(lang)}
            >
              <Text
                style={[
                  styles.langButtonText,
                  language === lang && styles.langButtonTextActive,
                ]}
              >
                {lang.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.featuresContainer}>
        {features.map((feature) => (
          <TouchableOpacity
            key={feature.id}
            style={styles.featureCard}
            onPress={() => navigation.navigate(feature.screen)}
            activeOpacity={0.7}
          >
            <Text style={styles.featureIcon}>{feature.icon}</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>
                {feature.description}
              </Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {translations[language].disclaimer}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#10b981',
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  languageSelector: {
    padding: 16,
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    elevation: 2,
  },
  languageLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    color: '#374151',
  },
  languageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  langButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: 'white',
  },
  langButtonActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  langButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  langButtonTextActive: {
    color: 'white',
  },
  featuresContainer: {
    flex: 1,
    padding: 16,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
  },
  featureIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  arrow: {
    fontSize: 32,
    color: '#d1d5db',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fef3c7',
    borderTopWidth: 1,
    borderTopColor: '#fbbf24',
  },
  footerText: {
    fontSize: 12,
    color: '#92400e',
    textAlign: 'center',
  },
});

export default HomeScreen;
