const express = require('express')
const registerUser = require('../controller/registerUser')
const checkEmail = require('../controller/checkEmail')
const checkpassword = require('../controller/checkpassword')
const userDetails = require('../controller/userDetails')
const logout = require('../controller/logout')
const updateUserDetails = require('../controller/updateUserDetails')
const { getConversation, sendMessage, sendFile, clearConversation, upload } = require('../controller/conversation')
const searchUser = require('../controller/searchUser')
const addFriend = require('../controller/addFriend')
const getFriends = require('../controller/getFriends')
const getFriendRequests = require('../controller/getFriendRequests')
const acceptFriendRequest = require('../controller/acceptFriendRequest')
const rejectFriendRequest = require('../controller/rejectFriendRequest')
const removeFriend = require('../controller/removeFriend')
const {
    sendPasswordResetOTP,
    verifyPasswordResetOTP,
    resetPassword
} = require('../controller/passwordController');


const router = express.Router()

//create user API
router.post('/register', registerUser)

// check user email
router.post('/email', checkEmail)

//check user password
router.post('/password', checkpassword)

//login details
router.get('/user-details', userDetails)

//logout user
router.get('/logout', logout)

//user update profie and name
router.post('/update-user', updateUserDetails)
//reset password 
router.post('/send-otp', sendPasswordResetOTP);
router.post('/verify-otp', verifyPasswordResetOTP);
router.post('/reset-password', resetPassword);

//conversation routes

router.get('/conversation/:otherUserId', getConversation);
router.post('/conversation/send', sendMessage);
router.post('/conversation/send-file', upload.single('file'), sendFile);
router.delete('/conversation/:otherUserId', clearConversation);

//search user
router.post('/search-user', searchUser)

//friends routes
router.post('/add-friend', addFriend)
router.get('/friends', getFriends)
router.get('/friend-requests', getFriendRequests)
router.post('/accept-friend-request', acceptFriendRequest)
router.post('/reject-friend-request', rejectFriendRequest)
router.post('/remove-friend', removeFriend)



module.exports = router
