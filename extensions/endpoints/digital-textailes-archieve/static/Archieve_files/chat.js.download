const chatbotButton = document.getElementById("chatbot-button");
const chatbotWindow = document.getElementById("chatbot-window");
const conversationBox = document.getElementById("conversation-box");
const messageInput = document.getElementById("message");
const sendButton = document.getElementById("send-button");
const closeButton = document.getElementById("cclose-button");

const botIcon = '<img class="bot-icon" src="/media/Chat_Bot_icon_30x30.png">';

// Initialize Bootstrap tooltip
var tooltip = new bootstrap.Tooltip(chatbotButton);
var textShown = false;

function showText() {
    console.debug('textShown: ' + textShown);
    const htmlContent = `<p>Είμαι η Μελίνα, λάτρης του θεάτρου και βοηθός στο αρχείο του Εθνικού Θεάτρου. 
    Είμαι εδώ για να σας παρέχω πληροφορίες για παλαιότερες παραστάσεις. 
    Παρακαλώ σημειώστε ότι όλες οι συνομιλίες καταγράφονται για λόγους ποιότητας και εκπαίδευσης. Μην μοιράζεστε προσωπικά στοιχεία. 
    Πώς μπορώ να σας εξυπηρετήσω;</p> 
    <p>Παραδείγματα ερωτήσεων:</p>
    <ul>
    <li>Θέλω να δω φωτογραφίες από την παράσταση 'Ξύπνα Βασίλη'</li>
    <li>Σε ποιες παραστάσεις έχει παίξει η Παξινού</li>
    <li>Ψάχνω τις περιοδείες του Εθνικού Θεάτρου στο εξωτερικό</li>
    </ul>
    `;
    const typingTextElement = document.getElementById("typing-text");
    
    // Convert the HTML string into a DOM structure
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const elements = doc.body.childNodes;

    let currentElementIndex = 0;

    function typeElement(element, container) {
        if (element.nodeType === Node.TEXT_NODE) {
            return typeText(element.textContent, container);
        } else {
            const clone = element.cloneNode(false);
            container.appendChild(clone);
            return typeNodes(Array.from(element.childNodes), clone);
        }
    }

    function typeNodes(nodes, container) {
        return new Promise((resolve) => {
            let nodeIndex = 0;

            function typeNextNode() {
                if (nodeIndex < nodes.length) {
                    const node = nodes[nodeIndex];
                    typeElement(node, container).then(() => {
                        nodeIndex++;
                        typeNextNode();
                    });
                } else {
                    resolve();
                }
            }

            typeNextNode();
        });
    }

    function typeText(text, container) {
        let charIndex = 0;

        return new Promise((resolve) => {
            function typeCharacter() {
                if (charIndex < text.length) {
                    container.appendChild(document.createTextNode(text.charAt(charIndex)));
                    charIndex++;
                    setTimeout(typeCharacter, 10); // Adjust character typing speed here
                } else {
                    resolve();
                }
            }
            typeCharacter();
        });
    }

    function type() {
        if (currentElementIndex < elements.length) {
            const element = elements[currentElementIndex];
            typeElement(element, typingTextElement).then(() => {
                currentElementIndex++;
                type();
            });
        }
    }

    type();
}

// Show or hide chatbot window on click
chatbotButton.addEventListener("click", () => {
    if (!chatbotWindow.classList.contains('opened')) {
        chatbotWindow.classList.add('opened');
        if (!textShown) {
            showText();
            textShown = true;
        }
    } else {
        chatbotWindow.classList.remove('opened');
    }
});

// Close chatbot window
closeButton.addEventListener("click", () => {
    chatbotWindow.classList.remove('opened');
});

const ws = new WebSocket('wss:/chat1.nt-archive.gr/chatstream');


//const ws = new WebSocket('');
//ws.url='ws:/194.177.217.94:9500/chatstream';
//if(ws.readyState==1) {


// Initialize these two variables:
    let create_new_response = true;
    let receivedData = ''; // for streaming data

// Handle WebSocket open event
    ws.addEventListener('open', (event) => {
        //console.log('WebSocket connection opened:', event);
    });

// Handle WebSocket message event (when the server sends data)
    ws.addEventListener('message', (event) => {
        let data = event.data;

        if (create_new_response) {
            create_new_response = false;
            conversationBox.innerHTML += `<div class="bot-message"><img class="bot-icon" src="/media/Chat_Bot_icon_30x30.png"><span class="bot-message1"></span></div>`;
            if (document.querySelector('.loading')) {
                document.querySelector('.loading').remove();
            }
        }

        let chat_content = document.querySelectorAll('.bot-message1');
        let message_content = chat_content[chat_content.length - 1];
        if (data.trim() == "[END]") {
            // convert markdown
            message_content.innerHTML = converter.makeHtml(receivedData);
        } else {
            receivedData += data; // Append the received data
            message_content.innerHTML = converter.makeHtml(receivedData);
        }
        scrollToBottomOfResults();
    });

// Handle WebSocket error event
    ws.addEventListener('error', (event) => {
        console.error('WebSocket error:', event);
    });

// initialize HTML converted
    const converter = new showdown.Converter({openLinksInNewWindow: true});

    function processNewlines(text) {
        return text.replace(/\n/g, "<br>");
    }

// chatArea = document.querySelector("#chatbot-body");
    function scrollToBottomOfResults() {
        conversationBox.scrollTop = conversationBox.scrollHeight;
    }

// function toggleChatbot() {
//     const container = document.getElementById("chatbot-container");
//     const chatbot_id = document.getElementById("chatbot");
//     console.log(container.style.display);

//     if (chatbot_id.style.display === "flex") {
//         chatbot_id.style.display = "none";
//     } else {
//         chatbot_id.style.display = "flex";
//     }
// }

    function sendMessage() {
        const inputField = document.getElementById("message");
        const userQuery = inputField.value;
        const chatBody = document.getElementById("conversation-box");

        // Display user's message
        const formattedUserQuery = processNewlines(userQuery);
        chatBody.innerHTML += `<div class="user-message"><span class="user-message1">${formattedUserQuery}</span></div>`;
        inputField.value = "";

        chatBody.innerHTML += `<div class="loading"><span class="loading-dot"></span><span class="loading-dot"></span><span class="loading-dot"></span></div>`;

        // Send the user query as JSON to the server via WebSocket
        receivedData = '';
        create_new_response = true;
        ws.send(JSON.stringify({query: userQuery}));

        scrollToBottomOfResults();
    }

// Enter key to send, Shift+Enter for a new line
// document
//     .getElementById("user-input")
//     .addEventListener("keydown", function (event) {
//         if (event.key === "Enter" && !event.shiftKey) {
//             event.preventDefault();
//             sendMessage();
//         }
//     });

// Handle sending messages when the send button is clicked or Enter key is pressed
    sendButton.addEventListener("click", sendMessage);
    messageInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });
//}