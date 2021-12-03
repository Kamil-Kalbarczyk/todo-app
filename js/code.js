// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCukFr_rrEnty8NC7stO8QHTt_T2Q8uUiE",
    authDomain: "todo-app-kk.firebaseapp.com",
    projectId: "todo-app-kk",
    storageBucket: "todo-app-kk.appspot.com",
    messagingSenderId: "102460659302",
    appId: "1:102460659302:web:4248e6074d38e190f2bfa7"
};
import {
    initializeApp
} from 'https://www.gstatic.com/firebasejs/9.5.0/firebase-app.js'

// Add Firebase products that you want to use
/*  import {
     auth
 } from 'https://www.gstatic.com/firebasejs/9.5.0/firebase-auth.js' */

import {
    getFirestore,
    collection,
    addDoc,
    orderBy,
    query,
    getDocs,
    updateDoc,
    doc,
    deleteDoc,
    where
} from 'https://www.gstatic.com/firebasejs/9.5.0/firebase-firestore.js'

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore();


import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
}
from "https://www.gstatic.com/firebasejs/9.5.0/firebase-auth.js";

const auth = getAuth();


//register user

let currentUser;
const userInterface = document.querySelector('#userInterface');
const loginInterface = document.querySelector('#login');

const signupForm = document.querySelector('#signup form');
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = document.querySelector('#signup [type="email"]');
    const passwordInput = document.querySelector('#signup [type="password"]');
    const email = emailInput.value;
    const password = passwordInput.value;
    if (email && password) {
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                currentUser = user.uid;
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                if (error) {
                    userInterface.classList.add('displayNone');
                    loginInterface.classList.remove('displayNone');
                }
                alert('login does not work!');
            });
        userInterface.classList.remove('displayNone');
        loginInterface.classList.add('displayNone');
    }
    emailInput.value = "";
    passwordInput.value = "";
});


// log user

document.querySelector('#signin form').addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = e.target.querySelector('[type="email"]');
    const passwordInput = e.target.querySelector('[type="password"]');
    const email = emailInput.value;
    const password = passwordInput.value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            currentUser = user.uid;
            fetch();
        })
        .catch((error) => {
            console.error(error)
            const errorCode = error.code;
            const errorMessage = error.message;
            if (error) {
                userInterface.classList.add('displayNone');
                loginInterface.classList.remove('displayNone');
                alert('Wrong password or email');
            }
        });
    userInterface.classList.remove('displayNone');
    loginInterface.classList.add('displayNone');
    emailInput.value = ""
    passwordInput.value = "";
});


// keeping user log in after page refresh

const userEmail = document.querySelector('#userInterface .logout p')

onAuthStateChanged(auth, (user) => {
    if (user) {
        const uid = user.uid;
        currentUser = user.uid;
        fetch();
        userEmail.textContent = user.email;
        userInterface.classList.remove('displayNone');
        loginInterface.classList.add('displayNone');
    } else {
        userInterface.classList.add('displayNone');
        loginInterface.classList.remove('displayNone');
        taskList.innerHTML = "";
    }
});


// user log out

document.querySelector('#userInterface .logout button').addEventListener('click', () => {
    signOut(auth).then(() => {
        userInterface.classList.add('displayNone');
        loginInterface.classList.remove('displayNone');
        taskList.innerHTML = "";
        userEmail.textContent = "";

    }).catch((error) => {
        console.error(error);
    });
});


// add task to Firestore

const addTaskForm = document.querySelector('.addTask form');

const addTaskToFirestore = async (e) => {
    e.preventDefault();
    const taskValue = document.querySelector('.addTask form textarea');
    const docRef = await addDoc(collection(db, "todo"), {
        task: taskValue.value,
        done: false,
        authorID: currentUser
    });
    taskValue.value = "";
    fetch();
}

addTaskForm.addEventListener('submit', addTaskToFirestore);


// render task list

const taskList = document.querySelector('#taskList ul');

const fetch = async () => {
    const collectionTasks = collection(db, "todo");
    const q = query(collectionTasks, where("authorID", "==", `${currentUser}`));
    const querySnapshot = await getDocs(q);

    taskList.innerHTML = "";

    querySnapshot.forEach((item) => {
        const data = item.data();
        const task = document.createElement('li');

        const doneCheckbox = document.createElement('div');
        doneCheckbox.classList.add('doneCheckbox');
        const labelCheckbox = document.createElement('label');
        const inputCheckbox = document.createElement('input');
        inputCheckbox.setAttribute('type', 'checkbox');
        inputCheckbox.setAttribute('title', 'Done');
        inputCheckbox.setAttribute('id', 'done');
        doneCheckbox.append(labelCheckbox, inputCheckbox);

        const taskValue = document.createElement('p');
        taskValue.textContent = data.task;

        const actionButtons = document.createElement('div');
        actionButtons.classList.add('actionButtons');
        const editTaskButton = document.createElement('button');
        editTaskButton.textContent = 'edit';
        const deleteTaskButton = document.createElement('button');
        deleteTaskButton.textContent = 'delete';
        actionButtons.append(editTaskButton, deleteTaskButton);

        if (data.done === true) {
            inputCheckbox.setAttribute('checked', true);
            taskValue.style.textDecoration = "line-through";
            taskValue.style.opacity = '0.7';
            editTaskButton.style.opacity = '0.7';
            deleteTaskButton.style.opacity = '0.7';
        }

        task.append(doneCheckbox, taskValue, actionButtons);
        taskList.append(task);

        const docRef = doc(db, "todo", item.id);

        // change status task to done
        inputCheckbox.addEventListener('change', async function () {
            if (this.checked) {
                await updateDoc(docRef, {
                    done: true,
                });
                taskValue.style.textDecoration = "line-through";
                taskValue.style.opacity = '0.7';
                editTaskButton.style.opacity = '0.7';
                deleteTaskButton.style.opacity = '0.7';

            } else {
                await updateDoc(docRef, {
                    done: false,
                });
                taskValue.style.textDecoration = "none";
                taskValue.style.opacity = '1';
                editTaskButton.style.opacity = '1';
                deleteTaskButton.style.opacity = '1';
            }
        })

        // delete task

        deleteTaskButton.addEventListener('click', async () => {
            await deleteDoc(docRef);
            fetch();
        })

        // edit task

        editTaskButton.addEventListener('click', async () => {
            const editTask = document.createElement('textarea');
            editTask.style.cssText = `
            height: 100%;
            width: 100%;
            position: absolute;
            background-color: white;
            color: black;
            top: 0;
            left: 0;
            padding-left: 2px;
            resize: none;
            `;
            editTask.value = taskValue.textContent;
            taskValue.append(editTask);
            editTaskButton.textContent = "save";
            editTaskButton.style.cssText = `
                    background-color: #ddd;
                    color: black;
                    font-weight: bold;
                    width: 60px;
                    font-size: 20px;`
            editTaskButton.addEventListener('click', async () => {
                editTaskButton.style.cssText = `
                    width: 50px;
                    font-size: 12 px;
                    background-color: transparent;
                    color: white;
                    font-weight: normal;`
                await updateDoc(docRef, {
                    task: editTask.value,
                });
                taskValue.remove(editTask);
                fetch();
            })
        })
    });
};