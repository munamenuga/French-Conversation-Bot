const fs = require('fs');
const path = require('path');

class VocabularyLogger {
  constructor(filePath) {
    this.filePath = filePath;
    this.ensureFileExists();
  }

  ensureFileExists() {
    if (!fs.existsSync(this.filePath)) {
      const initialData = {
        metadata: {
          created: new Date().toISOString(),
          description: 'French vocabulary and corrections log'
        },
        users: {}
      };
      fs.writeFileSync(this.filePath, JSON.stringify(initialData, null, 2));
    }
  }

  readData() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading vocabulary file:', error);
      return { metadata: {}, users: {} };
    }
  }

  writeData(data) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error writing vocabulary file:', error);
    }
  }

  logWord(phoneNumber, word, definition, type = 'vocabulary') {
    const data = this.readData();
    
    if (!data.users[phoneNumber]) {
      data.users[phoneNumber] = {
        firstSeen: new Date().toISOString(),
        vocabulary: [],
        corrections: []
      };
    }

    const entry = {
      word,
      definition,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString('fr-FR')
    };

    if (type === 'correction') {
      data.users[phoneNumber].corrections.push(entry);
    } else {
      const existingIndex = data.users[phoneNumber].vocabulary.findIndex(
        v => v.word.toLowerCase() === word.toLowerCase()
      );
      
      if (existingIndex === -1) {
        data.users[phoneNumber].vocabulary.push(entry);
      } else {
        data.users[phoneNumber].vocabulary[existingIndex] = {
          ...data.users[phoneNumber].vocabulary[existingIndex],
          definition,
          lastSeen: new Date().toISOString()
        };
      }
    }

    this.writeData(data);
    console.log(`Logged ${type}: ${word} for ${phoneNumber}`);
  }

  getUserVocabulary(phoneNumber) {
    const data = this.readData();
    return data.users[phoneNumber] || null;
  }

  getAllUsers() {
    const data = this.readData();
    return Object.keys(data.users);
  }

  getStats(phoneNumber) {
    const userData = this.getUserVocabulary(phoneNumber);
    if (!userData) {
      return null;
    }

    return {
      totalVocabulary: userData.vocabulary.length,
      totalCorrections: userData.corrections.length,
      firstSeen: userData.firstSeen,
      recentWords: userData.vocabulary.slice(-10)
    };
  }
}

module.exports = VocabularyLogger;
