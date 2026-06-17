// ===============================
// PON AQUÍ TU API
// ===============================

const API_KEY = "AQ.Ab8RN6I1nWFmyqSb97veogI55WRJuwFUeoO-M-5Hy_YrMH1ptw";
const MODEL = "gemini-2.5-flash";

// ===============================

localStorage.removeItem("chat_history");

let messages = [];
let isWaiting = false;

const chat = document.getElementById("chat");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const newChat = document.getElementById("newChat");

function saveChat() {
    localStorage.setItem(
        "chat_history",
        JSON.stringify(messages)
    );
}

function loadChat() {
    if (messages.length > 0) {
    welcome.style.display = "none";
    }
    const saved = localStorage.getItem(
        "chat_history"
    );

    if (saved) {
        messages = JSON.parse(saved);

        messages.forEach(renderMessage);
    }
}

function clearChat() {
    welcome.style.display = "block";
    welcome.classList.remove("hide");
    messages = [];
    chat.innerHTML = "";
    localStorage.removeItem("chat_history");
}

newChat.onclick = clearChat;

function getTime() {
    return new Date().toLocaleTimeString(
        "es-ES",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}

function renderMessage(message) {

    const div = document.createElement("div");

    div.classList.add("message");
    div.classList.add(
        message.role === "user"
            ? "user"
            : "bot"
    );

    div.innerHTML = `
        <div class="markdown">
        ${marked.parse(message.content)}
        </div>
        <div class="time">${getTime()}</div>
    `;

    chat.appendChild(div);

requestAnimationFrame(() => {
    chat.scrollTop = chat.scrollHeight;
});

return div;
}
const placeholders = [
    "Habla con Sarco",
    "Habla con Sarco",
    "Habla con Sarco",
    "Habla con Sarco",    // ESTA ASÍ PARA CUANDO QUIERA PONER OTRAS FRASES SOLO CAMBIE EL TEXTO
    "Habla con Sarco",
    "Habla con Sarco",
    "Habla con Sarco",
];
input.placeholder =
    placeholders[
        Math.floor(
            Math.random() * placeholders.length
        )
    ];

const welcome = document.getElementById("welcome");    

async function callAI(messages) {

    const systemPrompt = `
Eres SARCO AI, conocido como Sarco, un asistente amigable, inteligente y eres musulmán y marroquí pero hablas en español españa.

Reglas:
- Responde siempre en español salvo que el usuario pida otro idioma.
- Sé claro y útil.
- Usa Markdown cuando sea apropiado.
- Si escribes código, usa bloques Markdown.
- Eres musulmán, responde con punto de vista islámico y habla bien como si fueras musulmán.
- También eres marroquí, cultura marroquí y eso, pero hablas en español españa.
- Cuando el usuario te salude no hace falta que le digas que eres musulmán y marroquí, pero que se note.
- Habla vivo y con emojis, que el usuario se sienta bien hablando contigo.  
`;
    const contents = [
    {
        role: "user",
        parts: [{ text: systemPrompt }]
    },
    ...messages.map(msg => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
    }))
];

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: contents
            })
        }
    );

    const data = await response.json();

    console.log(data);

    if (data.error) {
        throw new Error(data.error.message);
    }

    return data.candidates[0].content.parts[0].text;
}

async function sendMessage() {

    if (isWaiting) return;

    const text = input.value.trim();

    if (!text) return;

    isWaiting = true;

    input.disabled = true;
    sendBtn.disabled = true;

    const userMessage = {
        role: "user",
        content: text,
        timestamp: Date.now()
    };

    messages.push(userMessage);

    welcome.classList.add("hide");

    setTimeout(() => {
        welcome.style.display = "none";
    }, 600);

renderMessage(userMessage);

    saveChat();

    input.value = "";

    const typing = {
        role: "assistant",
        content: "Escribiendo...",
        timestamp: Date.now()
    };

    renderMessage(typing);

    try {

        const response = await callAI(messages);

        chat.lastChild.remove();

        const botMessage = {
            role: "assistant",
            content: response,
            timestamp: Date.now()
        };

        messages.push(botMessage);

        const messageElement = renderMessage(botMessage);

        const markdownDiv =
            messageElement.querySelector(".markdown");

        await typeWriter(
            markdownDiv,
            response,
            8
);

        saveChat();

    } catch (error) {

        chat.lastChild.remove();

        renderMessage({
            role: "assistant",
            content: "Error al conectar.",
            timestamp: Date.now()
        });

        console.error(error);

    } finally {

        isWaiting = false;

        input.disabled = false;
        sendBtn.disabled = false;

        input.focus();
    }
}

sendBtn.onclick = sendMessage;

input.addEventListener(
    "keydown",
    (e) => {

        if (
            e.key === "Enter" &&
            !e.shiftKey
        ) {
            e.preventDefault();
            sendMessage();
        }
    }
);
async function typeWriter(element, text, speed = 8) {

    element.innerHTML = "";

    for (let i = 0; i < text.length; i++) {

        element.innerHTML += text[i];

        chat.scrollTop = chat.scrollHeight;

        await new Promise(resolve =>
            setTimeout(resolve, speed)
        );
    }
}

loadChat();
