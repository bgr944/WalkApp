import React from 'react';
import { Modal, View, Text, Button, StyleSheet } from 'react-native';

const TriviaModal = ({ visible, questionData, onClose, onAnswer }) => {
    if (!questionData) return null;
  
    const { question, correct_answer, options } = questionData;
  
    return (
      <Modal visible={visible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <Text style={styles.question}>{question}</Text>
          {options.map((option, index) => (
            <Button
              key={index}
              title={option}
              onPress={() => onAnswer(option === correct_answer)}
            />
          ))}
          <Button title="Close" onPress={onClose} />
        </View>
      </Modal>
    );
  };
  

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
  },
  question: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default TriviaModal;
