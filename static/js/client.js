//Copyright (c) 2016, Skedans Systems, Inc.
//All rights reserved.
//
//Redistribution and use in source and binary forms, with or without
//modification, are permitted provided that the following conditions are met:
//
//  * Redistributions of source code must retain the above copyright notice,
//    this list of conditions and the following disclaimer.
//  * Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in the
//    documentation and/or other materials provided with the distribution.
//
//THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
//AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
//IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
//ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
//LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
//CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
//SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
//INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
//CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
//ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
//POSSIBILITY OF SUCH DAMAGE.

let selfEasyrtcid = "";
let roomOccupants = [];
let username = generateUsername();
easyrtc.setUsername(username);

const inputForm = document.querySelector("#messageForm");
const inputMessage = document.getElementById("sendMessageText");
inputForm.addEventListener("submit", () => { //Wysylanie wiadomosci
    if (roomOccupants.length == 1) {
        if (inputMessage.value == "") {
            return;
        }

        insertMessageToDOM(username, 'mine', inputMessage.value);
        inputMessage.value = "";
        return;
    }

    for (let i = 0; i < roomOccupants.length; i++) {
        sendStuffWS(roomOccupants[i]);
    }
});

function generateUsername() {
    let username;

    do {
        username = prompt("What's your name?");
    } while (username == "" || checkOccupantsName(username));

    return username;
}
 
function connect() {
  easyrtc.setPeerListener(insertMessageToDOM);
  easyrtc.setRoomOccupantListener(getOccupants);
  easyrtc.connect("default", loginSuccess, loginFailure);
}

function checkOccupantsName(name) {
    for (let i = 0; i < roomOccupants.length; i++) {
        if (easyrtc.idToName(roomOccupants[i]) == name) {
            return true;
        }
    }

    return false;
}

function getOccupants(roomName, occupants, isPrimary) {
    roomOccupants = easyrtc.getRoomOccupantsAsArray('default');
}
 
function sendStuffWS(otherEasyrtcid) {
  let text = document.querySelector('input[type="text"]');
  if(text.value.replace(/\s/g, "").length === 0) { // Don"t send just whitespace
    return;
  }
 
  easyrtc.sendDataWS(otherEasyrtcid, "theirs", text.value);
  insertMessageToDOM(username, 'mine', text.value);
  inputMessage.value = "";
}
 
function loginSuccess(easyrtcid) {
  selfEasyrtcid = easyrtcid;
  console.log("My ID: " + selfEasyrtcid);
  insertMessageToDOM(null, "info", "You have joined to room.");
}
 
function loginFailure(errorCode, message) {
  easyrtc.showError(errorCode, message);
}

function insertMessageToDOM(name, type, content) {
    const template = document.querySelector('template[data-template="message"]');
    const nameEl = template.content.querySelector('.message__name');
  
    if (name) {
      nameEl.innerText = easyrtc.idToName(name);
    }
  
    template.content.querySelector('.message__bubble').innerText = content;
    const clone = document.importNode(template.content, true);
    const messageEl = clone.querySelector('.message');
  
    if (type == "mine") {
      messageEl.classList.add('message--mine');
    } else if (type == "theirs") {
      messageEl.classList.add('message--theirs');
    } else {
        messageEl.classList.add('message--info');
    }
  
    const messagesEl = document.querySelector('.messages');
    messagesEl.appendChild(clone);
  
    // Scroll to bottom
    messagesEl.scrollTop = messagesEl.scrollHeight - messagesEl.clientHeight;
  }