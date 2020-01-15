const isValidEmail = email => {
	var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
	return email === '' || re.test(String(email).toLowerCase())
}
const isValidPhoneNumber = phone_number => {
	return /^(?:\+\d{1,3}|0\d{1,3}|00\d{1,2})?(?:\s?\(\d+\))?(?:[-\/\s.]|\d)+$/.test(
		phone_number
	)
}
const isValidNickname = name => {
	if (name && name.length >= 2) {
		return true
	}
	return false
}
const isValidPassword = password => {
	if (password && password.length > 0) {
		return true
	}
	return false
}
const isValidSecretWord = word => {
	if (word.length > 0) {
		return true
	}
	return false
}
module.exports = {
	isValidEmail,
	isValidPhoneNumber,
	isValidNickname,
	isValidPassword,
	isValidSecretWord
}
