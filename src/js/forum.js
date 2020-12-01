import ky from "ky";
import $ from "jquery";
import { formatDistance } from "date-fns";
import { fr } from "date-fns/locale";

function getMessageView(message) {
  const date = new Date(message.timestamp);

  const dateDistance = formatDistance(date, new Date(), { locale: fr });
  return `<div class="card my-3">
    <div class="card-body">
      <p class="card-text">${message.content}</p>
    </div>
      <div class="card-footer text-muted text-right">
      Par ${message.author}, il y a ${dateDistance}</div>
  </div>`;
}

function displayMessages(messages) {
  $(".messagesContainer").empty();
  // Iterate on messages and display getMessageView(message);
  $(".messagesContainer").append(
    messages.map((message) => getMessageView(message))
  );
}

async function refreshMessages() {
  let pageIndex = 0; // permet modifier valeur comme on veut, peut réassigner valeur
  let messages = []; // ne peut pas réassigner valeur seulement des éléments
  let hasMessages = true;

  while (hasMessages) {
    // eslint-disable-next-line
    const pageMessages = await ky
      .get(`https://ensmn.herokuapp.com/messages?page=${pageIndex}`)
      .json();

    hasMessages = pageMessages.length > 0;
    pageIndex += 1;
    messages = messages.concat(pageMessages);
  }

  // GET https://ensmn.herokuapp.com/messages

  displayMessages(messages.reverse());
}

setInterval(() => {
  refreshMessages();
}, 1000);

function sendMessage(message) {
  ky.post("https://ensmn.herokuapp.com/messages", { json: message }).then(() =>
    refreshMessages()
  );
  // After success, getMessages();
}

$("body").on("submit", "#formulaire", (event) => {
  // stop default form submission
  event.preventDefault();

  // get form id="formulaire"
  const $form = $("#formulaire");

  // retrieve data from form
  const data = $form.serializeArray();

  const messageData = {};
  data.forEach(({ name, value }) => {
    messageData[name] = value;
  });

  if (
    messageData.username == null ||
    messageData.message == null ||
    messageData.username.lenght === 0 ||
    messageData.message.lenght === 0
  ) {
    return;
  }
  console.log(messageData);
  sendMessage(messageData);
  $("#message").val("");
});
