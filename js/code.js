  import {
      initializeApp
  } from 'https://www.gstatic.com/firebasejs/9.3.0/firebase-app.js'

  // If you enabled Analytics in your project, add the Firebase SDK for Google Analytics
  // import { analytics } from 'https://www.gstatic.com/firebasejs/9.3.0/firebase-analytics.js'

  // Add Firebase products that you want to use
  // import { auth } from 'https://www.gstatic.com/firebasejs/9.3.0/firebase-auth.js'
  import {
      getFirestore,
      collection,
      addDoc,
      query,
      where,
      getDocs,
      orderBy
  } from 'https://www.gstatic.com/firebasejs/9.3.0/firebase-firestore.js';
  import {
      getAuth,
      createUserWithEmailAndPassword,
      signInWithEmailAndPassword,
      signOut,
      onAuthStateChanged,
  } from "https://www.gstatic.com/firebasejs/9.3.0/firebase-auth.js";

  // Your web app's Firebase configuration
  const firebaseConfig = {
      apiKey: "AIzaSyBx2aotn409S36I0Sh2IgnfFTeBEQXUtcE",
      authDomain: "jfdzr5--kk.firebaseapp.com",
      projectId: "jfdzr5--kk",
      storageBucket: "jfdzr5--kk.appspot.com",
      messagingSenderId: "292650614920",
      appId: "1:292650614920:web:2fe86ec295f5d27dee1f3d"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore();

  const auth = getAuth();

  //   variables
  const sections = document.querySelectorAll('section');
  const viewSection = (sec) => {
      sections.forEach((section) => {
          section.classList.add('displayNone')
      });
      sec.classList.remove('displayNone');
  };

  const labelsTaskCategory = document.querySelectorAll('#userView form div label');

  labelsTaskCategory.forEach((label) => {
      label.addEventListener('click', () => {
          labelsTaskCategory.forEach((lab) => {
              lab.classList.remove('chosenCategory');
          });
          label.classList.add('chosenCategory')
      });
  });

  //   render tasks

  const workTaskCategorySection = document.querySelector('.taskCategories__work ul');
  const homeTaskCategorySection = document.querySelector('.taskCategories__house ul');
  const otherTaskCategorySection = document.querySelector('.taskCategories__other ul');

  const fetch = async () => {
      const collectionTasks = collection(db, "tasks")
      const q = query(collectionTasks, orderBy("date"));
      const querySnapshot = await getDocs(q);

      workTaskCategorySection.textContent = "";
      homeTaskCategorySection.textContent = "";
      otherTaskCategorySection.textContent = "";

      querySnapshot.forEach((doc) => {
          const data = doc.data();
          const task = document.createElement('li');
          const taskName = document.createElement('div');
          const taskDate = document.createElement('div');
          taskName.textContent = data.name;
          taskDate.textContent = data.date;
          task.append(taskName);
          task.append(taskDate);
          if (data.category === 'work') {
              workTaskCategorySection.append(task);
          } else if (data.category === 'home') {
              homeTaskCategorySection.append(task);
          } else {
              otherTaskCategorySection.append(task);
          };
          labelsTaskCategory.forEach((lab) => {
              lab.classList.remove('chosenCategory');
          });
      });
  }

  //register user

  const signupForm = document.querySelector('#signup form');
  signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.querySelector('#signup [type="email"]').value;
      const password = document.querySelector('#signup [type="password"]').value;
      createUserWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
              // Signed in
              const user = userCredential.user;
              // ...
          })
          .catch((error) => {
              const errorCode = error.code;
              const errorMessage = error.message;
              // ..
          });
  });

  // log user

  document.querySelector('#signin form').addEventListener('submit', (e) => {
      e.preventDefault();
      const email = e.target.querySelector('[type="email"]').value;
      const password = e.target.querySelector('[type="password"]').value;
      signInWithEmailAndPassword(auth, email, password)
          .then(fetch())
          .then(() => {
              viewSection(document.querySelector('#userView'));
          })
          .catch(console.error);
  })

  //   add task

  const addTaskForm = document.querySelector('.addTask form');

  addTaskForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const taskName = document.querySelector('.addTask form [type="text"]');
      const taskDate = document.querySelector('.addTask form [type="date"]');
      let taskCategory;
      const taskCategories = document.querySelectorAll('.addTask form div input');
      taskCategories.forEach(function (category) {
          if (category.checked) {
              taskCategory = category.getAttribute('id');
          }
      });
      if (!taskCategory) {
          return alert('chose type of task')
      }

      const docRef = await addDoc(collection(db, "tasks"), {
          name: taskName.value,
          category: taskCategory,
          date: taskDate.value
      });
      fetch();

      taskName.value = "";
      taskDate.value = "";
      taskCategories.forEach((category) => {
          category.checked = false;
      })

  });