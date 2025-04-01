import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons'; // Import FontAwesome for star icons
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import { ChevronLeft } from 'lucide-react-native';

export default function feedback() {
    const [rating, setRating] = useState(0); // Change to number for star rating
    const [comment, setComment] = useState('');
    const navigation = useNavigation(); // Initialize navigation

    const renderStars = () => {
        return Array.from({ length: 5 }, (_, index) => (
            <TouchableOpacity key={index} onPress={() => setRating(index + 1)}>
                <FontAwesome
                    name="star"
                    size={30}
                    color={index < rating ? '#FFD700' : '#ccc'} // Gold for selected, gray for unselected
                />
            </TouchableOpacity>
        ));
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <SafeAreaView style={styles.container}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.navigate('profile')} // Redirect to profile page
                    >
                    <View style={styles.backButtonContent}>
                        <ChevronLeft size={24} color="#24a0ed" />
                        <Text style={styles.backButtonText}>Back</Text>
                    </View>
                </TouchableOpacity>
                    <View style={styles.mainContent}>
                    
                        <Text style={styles.heading}>Submit Feedback</Text>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Rating:</Text>
                            <View style={styles.starsContainer}>
                                {renderStars()}
                            </View>
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Comment:</Text>
                            <TextInput
                                style={styles.textarea}
                                value={comment}
                                onChangeText={(text) => setComment(text)}
                                multiline
                                placeholder="Enter your comments"
                            />
                        </View>
                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={() => {
                                console.log(`Rating: ${rating}, Comment: ${comment}`);
                                setRating(0); // Reset rating after submission
                                setComment(''); // Reset comment after submission
                                navigation.navigate('profile'); // Redirect to the profile page
                            }}
                        >
                            <Text style={styles.buttonText}>Submit</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    heading: {
        fontSize: 24, 
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 20,
    },
    mainContent: {
        flex: 1,
    },
    formGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        fontWeight: 'bold',
    },
    starsContainer: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingLeft: 10,
    },
    textarea: {
        height: 100,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingLeft: 10,
        paddingTop: 10,
        textAlignVertical: 'top', // for multiline input
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    submitButton: {
        backgroundColor: '#2196F3',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
      },
    backButton: {
        position: 'absolute',
        borderRadius: 8,
        top: 50,
        left: 10,
      },
      backButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      backButtonText: {
        color: '#24a0ed', // Change to black for better contrast
        fontSize: 18,
        // fontWeight: 'bold',
      },
});

