document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector('#compose-form').onsubmit = send_email

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      // Print emails
      console.log(emails);
      // ... do something else with emails ...
      emails.forEach(email => display_emails(mailbox, email));
    });
}

const send_email = () => {
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value
    })
  })
    .then(response => response.json())
    .then(result => console.log(result)); // Print result
  localStorage.clear();
  load_mailbox('sent');
  return false;
}

const display_emails = (mailbox, email) => {
  const emailCard = document.createElement('section');
  emailCard.id = 'email-card';
  document.getElementById('emails-view').appendChild(emailCard);

  const emailRecipients = document.createElement('div');
  emailRecipients.id = 'email-recipients';
  if (mailbox === 'sent') {
    emailRecipients.innerHTML = email.recipients; // slice from a number of characters
  } else {
    emailRecipients.innerHTML = email.sender;
  }

  const emailSubject = document.createElement('div');
  emailSubject.id = 'email-subject';
  emailSubject.innerHTML = email.subject;

  const emailDate = document.createElement('div');
  emailDate.id = 'email-date';
  emailDate.innerHTML = email.timestamp;

  [emailRecipients, emailSubject, emailDate]
    .forEach(element => emailCard.appendChild(element));
}
