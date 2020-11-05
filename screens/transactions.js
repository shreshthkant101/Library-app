import React from 'react';
import {Text, View, ImageBackground, TouchableOpacity, KeyboardAvoidingView, Image,TextInput} from 'react-native';
import * as Permissions from 'expo-permissions';
import {BarCodeScanner} from 'expo-barcode-scanner';
import firebase from 'firebase';
import db from '../config';

export default class Transactions extends React.Component {
    constructor(){
        super();
        this.state = {
            hasCameraPermission: null,
            scanned : false,
            scannedData : 'empty',
            buttonState: 'normal',
            scannedBookId: '',
            scannedStudentId: ''
        }
    }
    getCameraPermission = async (ID) => {
            var {status} = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({
            hasCameraPermission: status === 'granted',
            buttonState:ID,
            scanned:false,
        })
    
        {console.log(this.state.hasCameraPermission);console.log(this.state.buttonState);console.log(this.state.scanned);}
        
    }
    handleTransaction = async () => {

        var transactionTyp = await this.checkBookEligibility()
        if(!transactionTyp){
            alert("The book doesn't exist in the database");
            this.setState({scannedBookId: '',scannedStudentId:''});
        }else if(transactionTyp === 'issue'){
            
           var isStudentEligible = await this.checkStudentEligibilityForIssue();
            if(isStudentEligible){
                this.issue();
            }
            
        }else if(transactionTyp === 'return'){
            var isStudentEligible = await this.checkStudentEligibilityForReturn();
            if(isStudentEligible){
                this.return();
            }
        }
        this.setState({scannedBookId: '',scannedStudentId:''});
        
    }
    checkStudentEligibilityForIssue = async () => {
        const stref = await db.collection('students').where('id','==',this.state.scannedStudentId).get();
        var eligibility = '';
        console.log(stref.docs);
        if(stref.docs.length === 0 ){
            alert('Student doesn\'t exist.');
            eligibility = false;
            this.setState({scannedBookId: '',scannedStudentId:''});
        }
        else{
            stref.docs.map(doc => {
                var student = doc.data();
                if(student.issued < 2){
                    eligibility = true;
                }
                else{
                    eligibility = false;
                    alert('Student has already issued 2 books');
                    this.setState({scannedBookId: '',scannedStudentId:''});
                }
            })
        }
        return eligibility;
    }

    checkStudentEligibilityForReturn = async () => {
        const stref = await db.collection('transactions').where('book','==',this.state.scannedBookId).limit(1).get();
        
        var eligibility = '';
      
            stref.docs.map(doc => {
                var lastTransaction = doc.data();
                if(lastTransaction.student  == this.state.scannedStudentId){
                    eligibility = true;
                }
                else{
                    eligibility = false;
                    alert('Student hasn\'t issued this book.');
                    this.setState({scannedBookId: '',scannedStudentId:''});
                }
            })
        
        return eligibility;
    }


    checkBookEligibility = async () => {
        const bookRef =await db.collection('books').where('id','==',this.state.scannedBookId).get();
        var transactionType = "";
        console.log(bookRef.docs);
        if(bookRef.docs.length === 0){
            transactionType=false;
        }
        else{
            bookRef.docs.map(element => {
                var book = element.data();
                if(book.availability){
                    transactionType = 'issue';
                }
                else{
                    transactionType = 'return';
                }
            })
        }

        return transactionType;
    }


    issue = async () => {
        db.collection('transactions').add({
            'student':this.state.scannedStudentId,
            'book':this.state.scannedBookId,
            'date':firebase.firestore.Timestamp.now().toDate(),
            'type':'issue'
        })
        db.collection('books').doc(this.state.scannedBookId).update({
            'availability':false
        })
        
        db.collection('students').doc(this.state.scannedStudentId).update({
            'issued':firebase.firestore.FieldValue.increment(1),

        })
        alert('Book issued successfully!');
        this.setState({scannedBookId: '',scannedStudentId:''});
        
    }
    return = async () => {
        db.collection('transactions').add({
            'student':this.state.scannedStudentId,
            'book':this.state.scannedBookId,
            'date':firebase.firestore.Timestamp.now().toDate(),
            'type':'return'
        })
        db.collection('books').doc(this.state.scannedBookId).update({
            'availability':true
        })
        
        db.collection('students').doc(this.state.scannedStudentId).update({
            'issued':firebase.firestore.FieldValue.increment(-1),

        })
        alert('Book returned successfully!');
        this.setState({scannedBookId: '',scannedStudentId:''});
    }
    handleBarCode = async ({type,data}) => {
        console.log('Hello i\'m in handle barcode');
        if(this.state.buttonState === 'bookID'){
            console.log('Hello i\'m in book id');
            this.setState({scanned:true,scannedBookId:data, buttonState: 'normal'});
        }
        else if(this.state.buttonState === 'studentID'){
            this.setState({scanned:true,scannedStudentId:data, buttonState: 'normal'});
        }
        
    }
    render() {
        const hasCameraPermission =  this.state.hasCameraPermission;
        const buttonState = this.state.buttonState;
        const scanned = this.state.scanned;
     
        if(hasCameraPermission && buttonState === 'clicked'){
            return (

                <BarCodeScanner onBarCodeScanned={alert('clicked')}/>
            );
        }else if(buttonState === 'normal'){
            return (
                <KeyboardAvoidingView  style={{flex:1, alignItems:'center', justifyContent:'center'}} behavior="padding">
                    <ImageBackground source={require('../assets/bg.jpg')} 
                    style={{
                        width:'100%',
                        height:'100%',
                        alignItems:'center',
                        alignSelf:'center',
                        justifyContent:'center'
                        }}>
                        <View>
                        <Image source={require('../assets/image.png')} style={{width:150,height:150,alignSelf:'center',objectFit:'cover'}} />
                        <Text style={{textAlign:'center',fontSize:30}}>Library App</Text>
                        </View>
                        <View style={{flexDirection:'row',margin:20}}>
                            <TextInput placeholder="Book ID" style={{width:200,height:50,borderWidth:2,fontSize:15, borderRightWidth:0}} onChangeText={(text) => {
                                this.setState({scannedBookId: text});
                            }}/>
                            <TouchableOpacity 
                            onPress={() => {
                                this.getCameraPermission('bookID');
                            }}
                            style={{backgroundColor:'orange', width:50,borderWidth:2,borderLeftWidth:0}}>
                                <Text style={{color:'white',textAlign:'center',fontFamily:'roboto'}}>Scan</Text></TouchableOpacity>
                            </View>

                            <View style={{flexDirection:'row',margin:20}}>
                            <TextInput placeholder="Student ID" style={{width:200,height:50,borderWidth:2,fontSize:15, borderRightWidth:0}} onChangeText={(text) => {
                                this.setState({scannedStudentId: text});
                            }}/>
                            <TouchableOpacity 
                            style={{backgroundColor:'orange', width:50,borderWidth:2,borderLeftWidth:0}} 
                            onPress={() => {
                                this.getCameraPermission('studentID');
                            }}>
                                <Text style={{color:'white',textAlign:'center',fontFamily:'roboto'}}>
                                    Scan</Text>
                                    </TouchableOpacity>
                            </View>
                            <View>
                                <TouchableOpacity style={{
                                    alignSelf:'center',
                                    backgroundColor:'dodgerblue',
                                    width: 100,
                                    height: 'fit-content'
                                }} onPress={() => {
                                    this.handleTransaction();
                                }}>
                                    <Text style={{
                                        color:'white',
                                        textAlign:'center',
                                        alignSelf:'center',
                                        fontSize: 23,
                                        fontWeight:'bold',

                                    }}>
                                        Submit
                                    </Text>
                                </TouchableOpacity>
                            </View>
                    
                    
    
                        </ImageBackground>
    
                        
                </KeyboardAvoidingView>
            );
        }
        
        
    }
}