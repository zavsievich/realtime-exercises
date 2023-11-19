const chat = document.getElementById("chat");
const msgs = document.getElementById("msgs");
const presence = document.getElementById("presence-indicator");

// this will hold all the most recent messages
let allChat = [];

chat.addEventListener("submit", function (e) {
  e.preventDefault();
  postNewMsg(chat.elements.user.value, chat.elements.text.value);
  chat.elements.text.value = "";
});

async function postNewMsg(user, text) {
  const data = {
    user,
    text,
  };

  // request options
  const options = {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  };

  // send POST request
  // we're not sending any json back, but we could
  await fetch("/msgs", options);
}

async function getNewMsgs() {
  let reader;
  let readerResponse;
  const utf8Decoder = new TextDecoder("utf-8");

  try {
    const res = await fetch("/msgs");
    reader = res.body.getReader();
  } catch (error) {
    console.log("connection error " + error);
  }

  presence.innerText = "🟢";
  let done;

  do {
    try {
      readerResponse = await reader.read();
    } catch (error) {
      console.error("read error " + error);
      presence.innerText = "🔴";
      return;
    }

    const chunk = utf8Decoder.decode(readerResponse.value, { stream: true });
    console.log("chunk " + chunk);
    done = readerResponse.done;

    if (chunk) {
      try {
        const json = JSON.parse(chunk);
        allChat = json.msg;
        render();
      } catch {
        console.error("json parse error " + error);
      }
    }
  } while (!done);
  presence.innerText = "🔴";
}

function render() {
  const html = allChat.map(({ user, text, time, id }) =>
    template(user, text, time, id)
  );
  msgs.innerHTML = html.join("\n");
}

const template = (user, msg) =>
  `<li class="collection-item"><span class="badge">${user}</span>${msg}</li>`;

getNewMsgs();
