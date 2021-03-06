"use strict";

var g_objUserData = {};

var onload = function() {
    let UN = getCookie('UN');
    let PW = getCookie('PW');
    if (UN && PW) {
        Login(UN, PW);
        return;
    }
    SignUpFrame();
}

function SignUpFrame() {
    let sPage = "";
    sPage += "<p class='si_topBar'>";
    sPage += "<span class='si_topBarName'>parkerchat</span> - Create a New Account";
    sPage += "</p>";
    sPage += "<div class='si'>";
    sPage += "<div class='si_LogoContainer'>";
    sPage += "<img src='images/windowicon.png' class='si_logo'</img>";
    sPage += "</div>";
    sPage += "<div class='si_textContainer'>";
    sPage += "<div class='si_container'>";
    sPage += "<span class='si_text'>CREATE AN ACCOUNT</span>";
    sPage += "<a href=\"javascript:LoginFrame()\" class='si_text' style='float: right; font-size: 12px; margin-top: 4px;'>or login</a>"
    sPage += "<input id='first' type='input' class='si_text si_textBox' placeholder='First Name' maxlength=20 title='first name' /><br>";
    sPage += "<input id='last' type='input' class='si_text si_textBox' placeholder='Last Name' maxlength=20 title='last name' /><br>";
    sPage += "<input id='username' type='input' class='si_text si_textBox' placeholder='Username' maxlength=20 title='username' /><br>";
    sPage += "<input id='password' type='password' class='si_text si_textBox' placeholder='Password' title='password' /><br>";
    sPage += "<input id='confirm' type='password' class='si_text si_textBox' placeholder='Confirm Password' title='confirm password' />";
    sPage += "<div class='si_checkContainer'>"
    sPage += "<input id='Memory' class='si_checkbox' type='checkbox' checked=true>";
    sPage += "<label class='si_text si_rememberMe' for='Memory'>Stay Logged In</label>"
    sPage += "</div>";
    sPage += "<button class='si_createButton' onClick='checkNewAccount()'>Create Account</button>";
    sPage += "</div>";
    sPage += "</div>";
    sPage += "</div>";
    document.getElementById('Main').innerHTML = sPage;
}

function LoginFrame() {
    let sPage = "";
    sPage += "<p class='si_topBar'>";
    sPage += "<span class='si_topBarName'>parkerchat</span> - Login";
    sPage += "</p>";
    sPage += "<div class='si'>";
    sPage += "<div class='si_LogoContainer'>";
    sPage += "<img src='images/windowicon.png' class='si_logo'</img>";
    sPage += "</div>";
    sPage += "<div class='si_textContainer'>";
    sPage += "<div class='si_container'>";
    sPage += "<span class='si_text'>LOGIN</span>";
    sPage += "<a href=\"javascript:SignUpFrame()\" class='si_text' style='float: right; font-size: 12px; margin-top: 4px;'>or sign up</a>"
    sPage += "<input id='username' type='input' class='si_text si_textBox' placeholder='Username' maxlength=20 title='username' /><br>";
    sPage += "<input id='password' type='password' class='si_text si_textBox' placeholder='Password' title='password' /><br>";
    sPage += "<div class='si_checkContainer'>"
    sPage += "<input id='Memory' class='si_checkbox si_loginButton si_loginCheckbox' type='checkbox' checked=true>";
    sPage += "<label class='si_text si_rememberMe si_loginRemember' for='Memory'>Stay Logged In</label>"
    sPage += "</div>";
    sPage += "<button class='si_createButton si_loginButton' onClick='checkLogin()'>Login</button>";
    sPage += "</div>";
    sPage += "</div>";
    sPage += "</div>";
    document.getElementById('Main').innerHTML = sPage;
}

function checkNewAccount() {
    let sFirst = document.getElementById('first').value.trim();
    let sLast = document.getElementById('last').value.trim();
    let sUsername = document.getElementById('username').value.trim();
    let sPassword = document.getElementById('password').value.trim();
    let sConfirm = document.getElementById('confirm').value.trim();

    if (!sUsername) {
        document.getElementById('username').placeholder = "pick a username";
        return;
    }
    if (!sPassword) {
        document.getElementById('password').placeholder = "pick a password";
        return;
    }
    if (sPassword !== sConfirm) {
        document.getElementById('confirm').value = "";
        document.getElementById('confirm').placeholder = "password and confirm don't match";
        return;
    }

    g_objUserData.info = {
        first: sFirst,
        last: sLast
    };
    g_objUserData.password = sPassword;

    postFileFromServer("srv/signin.php", "uniqueUN=" + encodeURIComponent(sUsername), uniqueUNCallback);
    function uniqueUNCallback(data) {
        if (!data) {
            document.getElementById('username').value = "";
            document.getElementById('username').placeholder = "username taken, sorry";
            g_objUserData = {};
            return;
        }
        else
            createAccount(data);
    }
}

function createAccount(sUsername) {
    g_objUserData.password = HashThis(g_objUserData.password, 10000);

    if (document.getElementById('Memory').checked) {
        setCookie('UN', sUsername, 999);
        setCookie('PW', g_objUserData.password, 999);
    }

    g_objUserData.username = sUsername;

    let jsonUserData = JSON.stringify(g_objUserData);
    postFileFromServer("srv/signin.php", "createAccount=" + encodeURIComponent(jsonUserData), createAccountCallback);
    function createAccountCallback(data) {
        if (data) {
            g_objUserData.id = data;
            Login(g_objUserData.username, g_objUserData.password);
        }
    }
}

function checkLogin() {
    let sUsername = document.getElementById('username').value;
    let sPassword = document.getElementById('password').value;
    if (!sUsername) {
        document.getElementById('username').placeholder = "fill out username";
        return;
    }
    if (!sPassword) {
        document.getElementById('password').placeholder = "fill out password";
        return;
    }
    sPassword = HashThis(sPassword, 10000);

    if (document.getElementById('Memory').checked)
        g_objUserData.rememberMe = true;

    Login(sUsername, sPassword);
}

function Login(UN, PW) {
    g_objUserData.username = UN;
    g_objUserData.password = PW;

    let jsonCredentials = JSON.stringify(g_objUserData);
    postFileFromServer("srv/signin.php", "login=" + encodeURIComponent(jsonCredentials), LogInCallback);
    function LogInCallback(data) {
        if (data) {
            let objUserData = JSON.parse(data);
            g_objUserData.id = objUserData.id;
            let objInfo = JSON.parse(objUserData.info);
            g_objUserData.first = objInfo.first;
            g_objUserData.last = objInfo.last;

            if (g_objUserData.rememberMe) {
                setCookie('UN', g_objUserData.username, 999);
                setCookie('PW', g_objUserData.password, 999);
                g_objUserData.rememberMe = null;
            }
            MainFrame();
        }
        else
            g_objUserData = {};
    }
}

function MainFrame() {
    document.getElementById('Body').style.backgroundColor = "white";

    let sPage = "";
    sPage += "<div class='h_topBar'>";
    sPage += "<div class='h_topBarName'>parkerchat</div>"; // put messages icon on this bar
    sPage += "<a href=\"javascript:InboxFrame()\" class='h_topBarName h_link'>Inbox</a>"; // change style
    sPage += "<a href=\"javascript:ExploreFrame()\" class='h_topBarName h_link'>Explore</a>";
    sPage += "<img class='h_searchIcon' src='images/searchicon.png' onClick='search()'>";
    sPage += "<input type='text' id='search' class='h_searchBox' placeholder='Search'>";
    sPage += "</div>";

    sPage += "<div class='h_chatContainer'>";
    sPage += "<div class='h_chatterboxContainer'>";
    sPage += "<input id='chatterbox' class='h_chatterbox' placeholder='Chat!' maxlength=250>";
    sPage += "<img class='h_sendIcon' src='images/sendicon.png' onClick='sendChat()'>";
    sPage += "</div>";
    sPage += "</div>";

    sPage += "<div class='h_container'>";

    sPage += "<div class='h_accountContainer'>";
    sPage += "<button onClick='AccountInfoSetup(" + g_objUserData.id + ")'>Edit Profile</button>";
    sPage += "</div>";

    sPage += "<div id='h_feedContainer' class='h_feedContainer'>";
    sPage += "</div>";

    sPage += "<div class='h_friendsContainer'>";
    sPage += "</div>";

    sPage += "</div>";

    document.getElementById('Main').innerHTML = sPage;
    pullFeed();
}

function sendChat() {
    let sChat = document.getElementById('chatterbox').value.trim();
    if (0 == sChat.length)
        return;

    let objChatData = {};
    objChatData.user = g_objUserData.id;
    objChatData.username = g_objUserData.username;
    objChatData.data = sChat;
    let jsonChatData = JSON.stringify(objChatData);
    postFileFromServer("srv/main.php", "chat=" + encodeURIComponent(jsonChatData), sendChatCallback);
    function sendChatCallback(data) {
        MainFrame();
    }
}

function pullFeed() {
    postFileFromServer("srv/main.php", "pullFeed=" + encodeURIComponent(g_objUserData.id), pullFeedCallback);
    function pullFeedCallback(data) {
        let objFeedData = JSON.parse(data);
        let sPage = "";
        if (0 == objFeedData.length) {
            sPage += "<div class='i_item' style='background-color: #4267B2;' onClick='ExploreFrame()'>";
            sPage += "No Recent Activity, Find More Friends?";
            sPage += "</div>";
            document.getElementById('h_feedContainer').innerHTML = sPage;
            return;
        }

        objFeedData = objFeedData.sort((a, b) => new Date(a.tSent) < new Date(b.tSent) ? 1 : -1);

        for (let i=0; i<objFeedData.length; i++) {
            sPage += "<div class='i_item' onClick='CommentsFrame("+objFeedData[i].id+")'>";
            sPage += objFeedData[i].username + " says: " + objFeedData[i].chat + "<br>" + objFeedData[i].tSent;
            sPage += "</div>";
        }
        document.getElementById('h_feedContainer').innerHTML = sPage;
    }
}

function CommentsFrame(nId) {
    let sPage = "";
    sPage += "<div class='h_topBar'>";
    sPage += "<div class='h_topBarName' onClick='MainFrame()'>parkerchat</div>"; // put messages icon on this bar
    sPage += "<a href=\"javascript:InboxFrame()\" class='h_topBarName h_link'>Inbox</a>"; // change style
    sPage += "<a href=\"javascript:ExploreFrame()\" class='h_topBarName h_link'>Explore</a>";
    sPage += "<img class='h_searchIcon' src='images/searchicon.png' onClick='search()'>";
    sPage += "<input type='text' id='search' class='h_searchBox' placeholder='Search'>";
    sPage += "</div>";

    sPage += "<div class='h_chatContainer'>";
    sPage += "<div class='h_chatterboxContainer'>";
    sPage += "<input id='chatterbox' class='h_chatterbox' placeholder='Leave a Comment!' maxlength=250>";
    sPage += "<img class='h_sendIcon' src='images/sendicon.png' onClick='sendComment("+nId+")'>";
    sPage += "</div>";
    sPage += "</div>";

    sPage += "<div id='commentsContainer' class='i_main' style='border: 1px solid black;'>";
    sPage += "</div>";

    document.getElementById('Main').innerHTML = sPage;
    pullComments(nId);
}

function pullComments(nId) {
    postFileFromServer("srv/main.php", "pullComments=" + encodeURIComponent(nId), pullCommentsCallback);
    function pullCommentsCallback(data) {
        let objComments = JSON.parse(data);
        let sPage = "";
        if (0 == objComments.length) {
            sPage += "<div class='i_item' style='background-color: #4267B2;'>";
            sPage += "No comments yet, be the first to leave one";
            sPage += "</div>";
            document.getElementById('commentsContainer').innerHTML = sPage;
            return;
        }

        objComments = objComments.sort((a, b) => new Date(a.sent) < new Date(b.sent) ? 1 : -1);

        for (let i=0; i<objComments.length; i++) {
            sPage += "<div class='i_item' onClick='AccountInfoSetup("+objComments[i].user+")'>";
            sPage += objComments[i].username + " replies: " + objComments[i].data + "<br>" + objComments[i].sent;
            sPage += "</div>";
        }
        document.getElementById('commentsContainer').innerHTML = sPage;
    }
}

function sendComment(nChatId) {
    let sChat = document.getElementById('chatterbox').value.trim();
    if (0 == sChat.length)
        return;

    let objChatData = {};
    objChatData.user = g_objUserData.id;
    objChatData.username = g_objUserData.username;
    objChatData.data = sChat;
    objChatData.id = nChatId;
    let jsonChatData = JSON.stringify(objChatData);
    postFileFromServer("srv/main.php", "leaveComment=" + encodeURIComponent(jsonChatData), leaveCommentCallback);
    function leaveCommentCallback(data) {
        CommentsFrame(data);
    }
}

function AccountInfoSetup(nId) {
    postFileFromServer("srv/main.php", "pullUserData=" + encodeURIComponent(nId), pullUserDataCallback);
    function pullUserDataCallback(data) {
        AccountInfoFrame(data);
    }
}

function AccountInfoFrame(jsonUserData) {
    document.getElementById('Body').style.backgroundColor = "#4267B2";

    let objUserData = JSON.parse(jsonUserData);
    let objUserInfo = JSON.parse(objUserData.info);

    if (objUserData.username === g_objUserData.username) {
        AccountEditFrame(objUserData, objUserInfo);
        return;
    }
    let sFullName = objUserInfo.first.charAt(0).toUpperCase() + objUserInfo.first.slice(1) + " " + objUserInfo.last.charAt(0).toUpperCase() + objUserInfo.last.slice(1);

    let sPage = "";
    sPage += "<div class='h_topBar' style='border-bottom: none;'>";
    sPage += "<div class='h_topBarName' onClick='MainFrame()'>parkerchat</div>";
    sPage += "<a href=\"javascript:InboxFrame()\" class='h_topBarName h_link'>Inbox</a>"; // change style
    sPage += "<a href=\"javascript:ExploreFrame()\" class='h_topBarName h_link'>Explore</a>";
    sPage += "<img class='h_searchIcon' src='images/searchicon.png' onClick='search()'>";
    sPage += "<input type='text' id='search' class='h_searchBox' placeholder='Search'>";
    sPage += "</div>";
    sPage += "<div class='a_main'>";
    sPage += "<div class='a_title'>";
    sPage +=  "<b>" + sFullName.trim() + "'s Profile</b>";
    sPage += "</div>";
    sPage += "<div class='a_photo'>";
    sPage += "<img src='images/defaultPFP.jpg' class='a_profilePicture'>";
    sPage += "</div>";
    sPage += "<input type='text' class='a_ajaxFriends' id='friendsListSearch' onKeyUp='ajaxFriends()'>";
    sPage += "<div id='friendsList' class='a_Friends'></div>";
    sPage += "<div class='a_infoFrame'>";
    sPage += "<div class='a_accountInfoBlock'><b>Account Info:</b></div>";
    sPage += "<div class='a_accountInfoBlock'>Username: " + objUserData.username + "</div>";
    sPage += "<div class='a_accountInfoBlock'>First: " + objUserInfo.first.charAt(0).toUpperCase() + objUserInfo.first.slice(1) + "</div>";
    sPage += "<div class='a_accountInfoBlock'>Last: " + objUserInfo.last.charAt(0).toUpperCase() + objUserInfo.last.slice(1) + "</div>";
    sPage += "<div class='a_accountInfoBlock'>Joined: " + formatDate(objUserData.created) + "</div>";
    sPage += "<div class='a_accountInfoBlock'>Last Login: " + formatDate(objUserData.lastlogin) + "</div>";
    sPage += "<div class='a_accountInfoBlock' style='margin-top: 7px;'><b>Basic Info:</b></div>";
    sPage += "<div class='a_accountInfoBlock'>Sex: " + checkData(objUserInfo.sex) + "</div>";
    sPage += "<div class='a_accountInfoBlock'>School: " + checkData(objUserInfo.school) + "</div>";
    sPage += "<div class='a_accountInfoBlock'>Birthday: " + checkData(objUserInfo.birthday) + "</div>"; // format date maybe
    sPage += "<div class='a_accountInfoBlock'>City: " + checkData(objUserInfo.city) + "</div>";
    sPage += "<div class='a_accountInfoBlock'>Relationship: " + checkData(objUserInfo.relationship) + "</div>";
    sPage += "<div class='a_accountInfoBlock'>Hometown: " + checkData(objUserInfo.hometown) + "</div>";
    sPage += "<div class='a_accountInfoBlock'>Job: " + checkData(objUserInfo.job) + "</div>";
    sPage += "<div class='a_accountInfoBlock' style='margin-top: 7px;'><b>Contact Info:</b></div>";
    sPage += "<div class='a_accountInfoBlock'>Number: " + checkData(objUserInfo.phonenumber) + "</div>";
    sPage += "<div class='a_accountInfoBlock'>Email: " + checkData(objUserInfo.email) + "</div>";
    sPage += "</div>";
    sPage += "<div id='utility' class='a_utility'>";
    sPage += "<input id='editFriendship' type='button' class='a_utilButtons' style='top: 10px;'>";
    sPage += "<button class='a_utilButtons' style='top: 70px;' onClick='messageUser(objUserData.username)'>Message</button>";
    sPage += "<button class='a_utilButtons' style='top: 130px;' onClick='mentionUser(\"" + objUserData.username + "\")'>Mention</button>";
    sPage += "</div>";
    sPage += "</div>";

    document.getElementById('Main').innerHTML = sPage;

    pullFriends(objUserData.id);
    friendAdded(objUserData.id);
}

function friendAdded(nId) {
    let objFriendship = {
        userId: g_objUserData.id,
        friendId: nId
    }
    let jsonFriendship = JSON.stringify(objFriendship);
    postFileFromServer("srv/main.php", "checkFriendship=" + encodeURIComponent(jsonFriendship), checkFriendshipCallback);
    function checkFriendshipCallback(data) {
        let objData = JSON.parse(data);
        if (1 == objData.rows) { // 1 == they are friends
            document.getElementById('editFriendship').addEventListener("click", function() { removeFriend(objData.id) });
            document.getElementById('editFriendship').value = "Remove";
        }
        else if (1 == objData.requested) { // other sent a friend request
            document.getElementById('editFriendship').addEventListener("click", function() { acceptRequest(objData.id) }); // deccline request button somewhere
            document.getElementById('editFriendship').value = "Accept";
        }
        else {
            document.getElementById('editFriendship').addEventListener("click", function() { sendFriendRequest(objData.id) });
            document.getElementById('editFriendship').value = "Add";
        }
    }
}

function acceptRequest(nId) {
    let objNewFriendship = {
        a: g_objUserData.id,
        b: nId,
        data: g_objUserData.username
    }
    let jsonNewFriendship = JSON.stringify(objNewFriendship);
    postFileFromServer("srv/main.php", "acceptRequest=" + encodeURIComponent(jsonNewFriendship), acceptRequestCallback);
    function acceptRequestCallback(data) {
        InboxFrame();
    }
}

function declineRequest(nId) {
    let objNotFriendship = {
        a: g_objUserData.id,
        b: nId
    }
    let jsonNotFriendship = JSON.stringify(objNotFriendship);
    postFileFromServer("srv/main.php", "declineRequest=" + encodeURIComponent(jsonNotFriendship), declineRequestCallback);
    function declineRequestCallback(data) {
        InboxFrame();
    }
}

function removeFriend(nId) {
    let objFriendship = {
        userId: g_objUserData.id,
        friendId: nId
    }
    let jsonFriendship = JSON.stringify(objFriendship);
    postFileFromServer("srv/main.php", "removeFriendship=" + encodeURIComponent(jsonFriendship), removeFriendshipCallback);
    function removeFriendshipCallback(data) {
        MainFrame(); // send user notice
    }
}

function pullFriends(nId) {
    postFileFromServer("srv/main.php", "pullFriends=" + encodeURIComponent(nId), pullFriendsCallback);
    function pullFriendsCallback(data) {
        let objFriends = JSON.parse(data);
        let sFriendsList = "";
        if (0 == objFriends.length) {
            sFriendsList += "<div class='a_friendDiv' style='text-align: center; height: 35px; padding-left: 0px;'>No Friends Added</div>";
            document.getElementById('friendsList').innerHTML = sFriendsList;
            return;
        }

        g_objUserData.friendsList = [];

        for (let i=0; i<objFriends.length; i++) {
            let objCurrFriend = JSON.parse(objFriends[i].info);
            let sFullName = objCurrFriend.first.charAt(0).toUpperCase() + objCurrFriend.first.slice(1) + " " + objCurrFriend.last.charAt(0).toUpperCase() + objCurrFriend.last.slice(1);
            sFriendsList += "<div class='a_friendDiv' onClick='AccountInfoSetup(\"" + objFriends[i].id + "\")'>" + objFriends[i].username + "<br>";
            g_objUserData.friendsList.push(objFriends[i]);
            sFriendsList += sFullName.trim() + "<br>";
            sFriendsList += "Last Online:<br>"
            sFriendsList += formatDate(objFriends[i].lastlogin);
            sFriendsList += "</div>";
        }
        document.getElementById('friendsList').innerHTML = sFriendsList;
    }
}

function ajaxFriends() {
    let sSearch = document.getElementById('friendsListSearch').value;

    let sFriendsList = "";

    for (let i=0; i<g_objUserData.friendsList.length; i++) {
        let objCurrFriend = JSON.parse(g_objUserData.friendsList[i].info);
        if (!ajaxIncludes(sSearch, g_objUserData.friendsList[i].username, objCurrFriend)) continue;
        let sFullName = objCurrFriend.first.charAt(0).toUpperCase() + objCurrFriend.first.slice(1) + " " + objCurrFriend.last.charAt(0).toUpperCase() + objCurrFriend.last.slice(1);
        sFriendsList += "<div class='a_friendDiv' onClick='AccountInfoSetup(\"" + g_objUserData.friendsList[i].id + "\")'>" + g_objUserData.friendsList[i].username + "<br>";
        sFriendsList += sFullName.trim() + "<br>";
        sFriendsList += "Last Online:<br>"
        sFriendsList += formatDate(g_objUserData.friendsList[i].lastlogin);
        sFriendsList += "</div>";
    }
    document.getElementById('friendsList').innerHTML = sFriendsList;
}

function ajaxIncludes(sSearch, sUsername, objInfo) {
    if (sUsername.toLowerCase().indexOf(sSearch.toLowerCase()) != -1)      return true;
    if (objInfo.first.toLowerCase().indexOf(sSearch.toLowerCase()) != -1)  return true;
    if (objInfo.last.toLowerCase().indexOf(sSearch.toLowerCase()) != -1)   return true;
    return false;
}

function mentionUser(sUser) {
    MainFrame();
    document.getElementById('chatterbox').value = "Hey, @" + sUser + "!";
}

function sendFriendRequest(nId) {
    let objIDs = {
        data: g_objUserData.username,
        otherUser: nId,
        id: g_objUserData.id
    }
    let jsonIDs = JSON.stringify(objIDs);
    postFileFromServer("srv/main.php", "sendFriendRequest=" + encodeURIComponent(jsonIDs), sendFriendRequestCallback);
    function sendFriendRequestCallback(data) {
        MainFrame();
    }
}

function messageUser(sUser) {
    return;
}

function AccountEditFrame(objUserData, objUserInfo) {
    let sPage = "";
    sPage += "<div class='h_topBar' style='border-bottom: none;'>";
    sPage += "<div class='h_topBarName' onClick='MainFrame()'>parkerchat</div>";
    sPage += "<a href=\"javascript:InboxFrame()\" class='h_topBarName h_link'>Inbox</a>"; // change style
    sPage += "<a href=\"javascript:ExploreFrame()\" class='h_topBarName h_link'>Explore</a>";
    sPage += "<img class='h_searchIcon' src='images/searchicon.png' onClick='search()'>";
    sPage += "<input type='text' id='search' class='h_searchBox' placeholder='Search'>";
    sPage += "</div>";
    sPage += "<div class='a_main'>";
    sPage += "<div class='a_title'>";
    sPage +=  "<b>My Profile</b>";
    sPage += "</div>";
    sPage += "<div class='a_photo'>";
    sPage += "<img id='pfp' src='images/defaultPFP.jpg' class='a_profilePicture'>"; // this needs to be done
    sPage += "</div>";
    sPage += "<input type='text' class='a_ajaxFriends' id='friendsListSearch' onKeyUp='ajaxFriends()'>";
    sPage += "<div id='friendsList' class='a_Friends'></div>";
    sPage += "<div class='a_infoFrame'>";
    sPage += "<div class='a_accountInfoBlock'><b>Account Info:</b></div>";
    sPage += "<div class='a_accountInfoBlock'>Username: " + objUserData.username + "</div>";
    sPage += "<div class='a_accountInfoBlock'>First: ";
    sPage += "<input id='first' type='text' class='a_editData' maxlength=20 value='" + objUserInfo.first.charAt(0).toUpperCase() + objUserInfo.first.slice(1) + "'></div>";
    sPage += "<div class='a_accountInfoBlock'>Last: ";
    sPage += "<input id='last' type='text' class='a_editData' maxlength=20 value='" + objUserInfo.last.charAt(0).toUpperCase() + objUserInfo.last.slice(1) + "'></div>";
    sPage += "<div class='a_accountInfoBlock'>Joined: " + formatDate(objUserData.created) + "</div>";
    sPage += "<div class='a_accountInfoBlock'>Last Login: " + formatDate(objUserData.lastlogin) + "</div>";
    sPage += "<div class='a_accountInfoBlock' style='margin-top: 7px;'><b>Basic Info:</b></div>";
    sPage += "<div class='a_accountInfoBlock'>Sex: ";
    sPage += "<input id='sex' type='text' class='a_editData' maxlength=20 value='" + checkData(objUserInfo.sex) + "'></div>";
    sPage += "<div class='a_accountInfoBlock'>School: ";
    sPage += "<input id='school' type='text' class='a_editData' maxlength=20 value='" + checkData(objUserInfo.school) + "'></div>";
    sPage += "<div class='a_accountInfoBlock'>Birthday: ";
    sPage += "<input id='birthday' type='text' class='a_editData' maxlength=20 value='" + checkData(objUserInfo.birthday) + "'></div>";
    sPage += "<div class='a_accountInfoBlock'>City: ";
    sPage += "<input id='city' type='text' class='a_editData' maxlength=20 value='" + checkData(objUserInfo.city) + "'></div>";
    sPage += "<div class='a_accountInfoBlock'>Relationship: ";
    sPage += "<input id='relationship' type='text' class='a_editData' maxlength=20 value='" + checkData(objUserInfo.relationship) + "'></div>";
    sPage += "<div class='a_accountInfoBlock'>Hometown: ";
    sPage += "<input id='hometown' type='text' class='a_editData' maxlength=20 value='" + checkData(objUserInfo.hometown) + "'></div>";
    sPage += "<div class='a_accountInfoBlock'>Job: ";
    sPage += "<input id='job' type='text' class='a_editData' maxlength=20 value='" + checkData(objUserInfo.job) + "'></div>";
    sPage += "<div class='a_accountInfoBlock' style='margin-top: 7px;'><b>Contact Info:</b></div>";
    sPage += "<div class='a_accountInfoBlock'>Number: ";
    sPage += "<input id='phonenumber' type='text' class='a_editData' maxlength=20 value='" + checkData(objUserInfo.phonenumber) + "'></div>";
    sPage += "<div class='a_accountInfoBlock'>Email: ";
    sPage += "<input id='email' type='text' class='a_editData' style='width: 220px;' maxlength=30 value='" + checkData(objUserInfo.email) + "'></div>";
    sPage += "</div>";
    sPage += "<div class='a_utility'>";
    sPage += "<button class='a_utilButtons' style='top: 10px;'>Edit Photo</button>";
    sPage += "<button class='a_utilButtons' style='top: 70px;' onClick='editProfile()'>Confirm Changes</button>";
    sPage += "</div>";
    sPage += "</div>";

    pullFriends(objUserData.id);
    document.getElementById('Main').innerHTML = sPage;
}

function editProfile() {
    let objAccountData = {};
    objAccountData.first = document.getElementById('first').value;
    objAccountData.last = document.getElementById('last').value;
    objAccountData.sex = document.getElementById('sex').value;
    objAccountData.school = document.getElementById('school').value;
    objAccountData.birthday = document.getElementById('birthday').value;
    objAccountData.city = document.getElementById('city').value;
    objAccountData.relationship = document.getElementById('relationship').value;
    objAccountData.hometown = document.getElementById('hometown').value;
    objAccountData.job = document.getElementById('job').value;
    objAccountData.phonenumber = document.getElementById('phonenumber').value;
    objAccountData.email = document.getElementById('email').value;
    let jsonAccountData = JSON.stringify(objAccountData);

    let objData = {
        id: g_objUserData.id,
        info: jsonAccountData
    }
    let jsonData = JSON.stringify(objData);

    postFileFromServer("srv/main.php", "editAccountData=" + encodeURIComponent(jsonData), editAccountDataCallback);
    function editAccountDataCallback(data) {
        MainFrame();
    }
}

function search() {
    // AccountInfoSetup(document.getElementById('search').value)
}

function formatDate(sDate) {
    let sMonth = getMonth(sDate.substring(5,7));
    let sDay = sDate.substring(8,10);
    let sYear = sDate.substring(0,4);
    return sMonth + " " + sDay + ", " + sYear;
}

function getMonth(nMonthNumber) {
    if ("01" == nMonthNumber) return "January";
    if ("02" == nMonthNumber) return "February";
    if ("03" == nMonthNumber) return "March";
    if ("04" == nMonthNumber) return "April";
    if ("05" == nMonthNumber) return "May";
    if ("06" == nMonthNumber) return "June";
    if ("07" == nMonthNumber) return "July";
    if ("08" == nMonthNumber) return "August";
    if ("09" == nMonthNumber) return "September";
    if ("10" == nMonthNumber) return "October";
    if ("11" == nMonthNumber) return "November";
    if ("12" == nMonthNumber) return "December";
}

function checkData(sData) {
    if (undefined === sData)
        return "";
    return sData;
}

function InboxFrame() {
    document.getElementById('Body').style.backgroundColor = "white";

    let sPage = "";
    sPage += "<div class='h_topBar' style='border-bottom: none;'>";
    sPage += "<div class='h_topBarName' onClick='MainFrame()'>parkerchat</div>";
    sPage += "<a href=\"javascript:ExploreFrame()\" class='h_topBarName h_link'>Explore</a>";
    sPage += "<img class='h_searchIcon' src='images/searchicon.png' onClick='search()'>";
    sPage += "<input type='text' id='search' class='h_searchBox' placeholder='Search'>";
    sPage += "</div>";
    sPage += "<div id='i_main' class='i_main'>";
    sPage += "</div>";

    document.getElementById('Main').innerHTML = sPage;

    pullInbox();
}

function pullInbox() {
    postFileFromServer("srv/main.php", "pullInbox=" + encodeURIComponent(g_objUserData.id), pullInboxCallback);
    function pullInboxCallback(data) {
        let objInbox = JSON.parse(data);
        let sPage = "";
        if (0 === objInbox.length) {
            sPage += "<div class='i_item' style='background-color: #4267B2;' onClick='ExploreFrame()'>";
            sPage += "No Recent Activity, Find More Friends?";
            sPage += "</div>";
            document.getElementById('i_main').innerHTML = sPage;
            return;
        }

        for (let i=0; i<objInbox.length; i++) {
            if (0 == objInbox[i].type) { // friend request recieved
                sPage += "<div class='i_item'>";
                sPage += "Friend Request From " + objInbox[i].data + "<br>" + objInbox[i].received + "<br>";
                sPage += "<a href=\"javascript:AccountInfoSetup("+objInbox[i].otherID+")\">view profile</a><br>";
                sPage += "<a href=\"javascript:acceptRequest(" + objInbox[i].otherID + ")\">accept</a> ";
                sPage += "<a href=\"javascript:declineRequest(" + objInbox[i].otherID + ")\">decline</a>";
                sPage += "</div>";
            }
            else if (1 == objInbox[i].type) { // friend request accepted
                sPage += "<div class='i_item'>";
                sPage += objInbox[i].data + " accepted your friend request" + "<br>";
                sPage += "<a href=\"javascript:AccountInfoSetup("+objInbox[i].otherID+")\">view profile</a><br>";
                sPage += "</div>";
            }
        }
        document.getElementById('i_main').innerHTML = sPage;
    }
}

function ExploreFrame() {
    document.getElementById('Body').style.backgroundColor = "white";

    let sPage = "";
    sPage += "<div class='h_topBar' style='border-bottom: none;'>";
    sPage += "<div class='h_topBarName' onClick='MainFrame()'>parkerchat</div>";
    sPage += "<a href=\"javascript:InboxFrame()\" class='h_topBarName h_link'>Inbox</a>";
    sPage += "<img class='h_searchIcon' src='images/searchicon.png' onClick='search()'>";
    sPage += "<input type='text' id='search' class='h_searchBox' placeholder='Search'>";
    sPage += "</div>";
    sPage += "<div id='e_main' class='i_main'>";
    sPage += "</div>";
    document.getElementById('Main').innerHTML = sPage;

    exploreFriends();
}

function exploreFriends() {
    postFileFromServer("srv/main.php", "exploreFriends=" + encodeURIComponent(g_objUserData.id), exploreFriendsCallback);
    function exploreFriendsCallback(data) {
        let aMutuals = JSON.parse(data);
        let sPage = "";

        if (0 == aMutuals.length) {
            sPage += "<div class='i_item' style='background-color: black;'>";
            sPage += "You have no mutual friends";
            sPage += "</div>";
            document.getElementById('e_main').innerHTML = sPage;
            return;
        }

        aMutuals = aMutuals.sort((a, b) => a.n < b.n ? 1 : -1);

        for (let i=0; i<aMutuals.length; i++) {
            let objCurrData = JSON.parse(aMutuals[i].json);
            let objCurrDataInfo = JSON.parse(objCurrData.info);
            let sFullName = objCurrDataInfo.first.charAt(0).toUpperCase() + objCurrDataInfo.first.slice(1) + " " + objCurrDataInfo.last.charAt(0).toUpperCase() + objCurrDataInfo.last.slice(1);
            sPage += "<div class='i_item' onClick='AccountInfoSetup(" + aMutuals[i].id + ")'>";
            sPage += sFullName.trim() + "<br>";
            sPage += "Last Online: " + formatDate(objCurrData.lastlogin) + "<br>";
            sPage += "You have " + aMutuals[i].n + " mutual friends";
            sPage += "</div>";
        }
        document.getElementById('e_main').innerHTML = sPage;
    }
}
