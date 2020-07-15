//signup
const signupForm = document.querySelector('#signupForm');
signupForm.addEventListener('submit',(e) => {
	e.preventDefault();

	// get user info
	const email = signupForm['email'].value;
	const password = signupForm['password'].value;

	//sign up the user
	auth.createUserWithEmailAndPassword(email,password).then(cred => {
		console.log(cred);
		})


})