import { 
    auth, 
    db, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut,
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    doc,
    updateDoc
} from '/src/firebase-config.js';

// DOM Elements
const userAvatar = document.getElementById('user-avatar');
const userName = document.getElementById('user-name');
const authBtn = document.getElementById('auth-btn');
const logoutBtn = document.getElementById('logout-btn');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const chatMessages = document.getElementById('chat-messages');
const conversationList = document.getElementById('conversation-list');
const newChatBtn = document.getElementById('new-chat-btn');
const currentConversation = document.getElementById('current-conversation');

// State
let currentUser = null;
let activeConversationId = null;

// Initialize the app
function init() {
    setupEventListeners();
    checkAuthState();
}

// Set up event listeners
function setupEventListeners() {
    // Authentication
    authBtn.addEventListener('click', signInWithGoogle);
    logoutBtn.addEventListener('click', handleSignOut);
    
    // Chat functionality
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Auto-resize textarea
    messageInput.addEventListener('input', () => {
        messageInput.style.height = 'auto';
        messageInput.style.height = (messageInput.scrollHeight) + 'px';
    });
    
    // New conversation
    newChatBtn.addEventListener('click', startNewConversation);
    
    // Suggestion buttons (event delegation)
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('suggestion-btn')) {
            messageInput.value = e.target.textContent;
            messageInput.focus();
        }
    });
}

// Check authentication state
function checkAuthState() {
    auth.onAuthStateChanged(user => {
        if (user) {
            // User is signed in
            currentUser = user;
            updateUserUI(user);
            loadConversations();
            startNewConversation();
        } else {
            // No user signed in
            currentUser = null;
            resetUI();
        }
    });
}

// Update UI with user info
function updateUserUI(user) {
    userAvatar.src = user.photoURL || 'https://via.placeholder.com/40';
    userName.textContent = user.displayName || 'User';
    authBtn.style.display = 'none';
    logoutBtn.style.display = 'block';
}

// Reset UI when no user is signed in
function resetUI() {
    userAvatar.src = 'https://via.placeholder.com/40';
    userName.textContent = 'Guest';
    authBtn.style.display = 'block';
    logoutBtn.style.display = 'none';
    chatMessages.innerHTML = `
        <div class="welcome-message">
            <h2>Welcome to NexiQ</h2>
            <p>Please sign in to start chatting with your AI assistant.</p>
        </div>
    `;
    conversationList.innerHTML = '';
}

// Sign in with Google
async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error('Error signing in:', error);
        alert('Error signing in. Please try again.');
    }
}

// Sign out
async function handleSignOut() {
    try {
        await signOut(auth);
        activeConversationId = null;
        currentConversation.textContent = 'New Chat';
    } catch (error) {
        console.error('Error signing out:', error);
    }
}

// Start a new conversation
function startNewConversation() {
    activeConversationId = null;
    currentConversation.textContent = 'New Chat';
    chatMessages.innerHTML = `
        <div class="welcome-message">
            <h2>Welcome to NexiQ</h2>
            <p>Your intelligent AI assistant ready to help with any questions.</p>
            <div class="suggestions">
                <button class="suggestion-btn">What can you do?</button>
                <button class="suggestion-btn">Tell me a fun fact</button>
                <button class="suggestion-btn">Help with coding</button>
            </div>
        </div>
    `;
}

// Load user's conversations
function loadConversations() {
    const q = query(
        collection(db, 'conversations'),
        where('userId', '==', currentUser.uid),
        orderBy('lastUpdated', 'desc')
    );
    
    onSnapshot(q, (snapshot) => {
        conversationList.innerHTML = '';
        
        snapshot.forEach(doc => {
            const conversation = doc.data();
            const conversationItem = document.createElement('div');
            conversationItem.className = 'conversation-item';
            conversationItem.textContent = conversation.title || 'New Conversation';
            conversationItem.addEventListener('click', () => loadConversation(doc.id, conversation.title));
            conversationList.appendChild(conversationItem);
        });
    });
}

// Load a specific conversation
function loadConversation(conversationId, title) {
    activeConversationId = conversationId;
    currentConversation.textContent = title || 'Conversation';
    chatMessages.innerHTML = '';
    
    const q = query(
        collection(db, 'conversations', conversationId, 'messages'),
        orderBy('timestamp')
    );
    
    onSnapshot(q, (snapshot) => {
        chatMessages.innerHTML = '';
        
        snapshot.forEach(doc => {
            const message = doc.data();
            addMessageToChat(message.text, message.sender, message.timestamp?.toDate());
        });
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });
}

// Send a message
async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message || !currentUser) return;
    
    // Add user message to UI
    addMessageToChat(message, 'user');
    
    // Clear input
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    try {
        // Create new conversation if none exists
        if (!activeConversationId) {
            const conversationRef = await addDoc(collection(db, 'conversations'), {
                userId: currentUser.uid,
                title: message.length > 30 ? message.substring(0, 30) + '...' : message,
                lastUpdated: new Date()
            });
            activeConversationId = conversationRef.id;
            currentConversation.textContent = message.length > 30 ? message.substring(0, 30) + '...' : message;
        }
        
        // Save user message to Firestore
        await addDoc(collection(db, 'conversations', activeConversationId, 'messages'), {
            text: message,
            sender: 'user',
            timestamp: new Date()
        });
        
        // Update conversation last updated time
        await updateDoc(doc(db, 'conversations', activeConversationId), {
            lastUpdated: new Date()
        });
        
        // Show typing indicator
        showTypingIndicator();
        
        // Generate AI response
        setTimeout(async () => {
            try {
                const aiResponse = generateAIResponse(message);
                
                // Remove typing indicator
                removeTypingIndicator();
                
                // Add AI response to UI
                addMessageToChat(aiResponse, 'ai');
                
                // Save AI response to Firestore
                await addDoc(collection(db, 'conversations', activeConversationId, 'messages'), {
                    text: aiResponse,
                    sender: 'ai',
                    timestamp: new Date()
                });
                
                // Update conversation last updated time
                await updateDoc(doc(db, 'conversations', activeConversationId), {
                    lastUpdated: new Date()
                });
            } catch (error) {
                console.error('Error generating AI response:', error);
                removeTypingIndicator();
                addMessageToChat("Sorry, I encountered an error. Please try again.", 'ai');
            }
        }, 1000);
    } catch (error) {
        console.error('Error sending message:', error);
        removeTypingIndicator();
        alert('Error sending message. Please try again.');
    }
}

// Add message to chat UI
function addMessageToChat(text, sender, timestamp) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.innerHTML = `
        <div class="message-text">${text}</div>
        <div class="message-time">${timestamp ? formatTime(timestamp) : 'Just now'}</div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Format time
function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Enhanced AI response generator
function generateAIResponse(userMessage) {
    const lowerMsg = userMessage.toLowerCase().trim();
    
    // Greetings
    if (/^(hi|hello|hey|greetings|hola|sup|what's up)/i.test(lowerMsg)) {
        const greetings = [
            "Hello there! I'm NexiQ. How can I assist you today?",
            "Hi! What can I do for you?",
            "Hey there! Ready to help with anything you need.",
            "Greetings! How can I be of service?"
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    // Questions about capabilities
    if (lowerMsg.includes("what can you do") || lowerMsg.includes("help with")) {
        return "I can answer questions, provide information, help with coding, tell fun facts, and more! Try asking me anything specific.";
    }
    
    // Default responses
    const defaultResponses = [
        "I'm not sure I understand. Could you rephrase that?",
        "That's an interesting point. Could you tell me more?",
        "I'm designed to assist with various topics. What specifically would you like to know?",
        "Let me think about that... Could you ask in a different way?"
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);