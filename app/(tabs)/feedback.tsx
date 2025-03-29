import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function feedback() {
    const [rating, setRating] = useState('');
    const [comment, setComment] = useState('');

    return (
        <SafeAreaView style={styles.container}>

            <View style={styles.mainContent}>
                <Text style={styles.heading}>Submit Feedback</Text>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Rating (1-5):</Text>
                    <TextInput
                        style={styles.input}
                        value={rating}
                        onChangeText={(text) => setRating(text)}
                        keyboardType="numeric"
                        maxLength={1}
                        placeholder="Enter rating (1-5)"

                    />
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
                <Button
                    title="Submit"
                    onPress={() => console.log('Feedback Submitted')}
                    color="#71a8e6"
                />
            </View>
        </SafeAreaView>
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
});

