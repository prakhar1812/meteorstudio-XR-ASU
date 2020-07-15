//signup
const signupForm = document.querySelector('#form-signin');
signupForm.addEventListener('submit',(e) => {
e.preventDefault();

	// get user info
	const email = signupForm['email'].value;
	const password = signupForm['password'].value;

	//sign up the user
	auth.createUserWithEmailAndPassword(email,password).then(cred => {
		console.log(cred.user);
		});


});

//logout
const logout = document.querySelector('#logout');
logout.addEventListener('click', (e) => {
	e.preventDefault();
	auth.signOut().then(() => {
	  console.log("user signed out");
})


//login
const loginForm = document.querySelector('#loginForm');
loginForm.addEventListener('submit', (e) => {
	e.preventDefault();

//get user info
const email = loginForm['email'].value;
const password = loginForm['password'.value;

auth.signInWithEmailAndPassword(email,password).then(cred => {
	console.log(cred.user);
	})
})