window.addEventListener('popstate', (e) => {
  const data = e.state;
  if (!data) {
    load_mailbox('inbox');
  } else if (data.email) {
    load_email(data.email)
    console.log('Worked!', data.email);
  } else {
    load_mailbox(data.mailbox)
    console.log('Mailbox');
  }
})

document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => {
    load_mailbox('inbox');
    history.pushState({ 'mailbox': 'inbox' }, '', 'inbox')
  });
  document.querySelector('#sent').addEventListener('click', () => {
    load_mailbox('sent');
    history.pushState({ 'mailbox': 'sent' }, '', 'sent')
  });
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
  document.querySelector('#email-content').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      // Print emails
      // console.log(emails);
      // ... do something else with emails ...
      emails.forEach(email => display_mailbox(mailbox, email));
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

const display_mailbox = (mailbox, email) => {
  const emailCard = document.createElement('a');
  emailCard.className = 'email-card';
  emailCard.addEventListener('click', () => {
    load_email(email)
    history.pushState({ 'mailbox': mailbox, 'email': email }, '', `email${email.id}`)
    console.log(history.state)
  });

  document.getElementById('emails-view').appendChild(emailCard);

  const emailRecipients = document.createElement('div');
  emailRecipients.className = 'email-owner';
  if (mailbox === 'sent') {
    emailRecipients.innerHTML = email.recipients; // slice from a number of characters
  } else {
    emailRecipients.innerHTML = email.sender;
  }

  const emailSubject = document.createElement('div');
  emailSubject.className = 'email-subject';
  emailSubject.innerHTML = email.subject;

  const emailDate = document.createElement('div');
  emailDate.className = 'email-date';
  emailDate.innerHTML = email.timestamp;

  [emailRecipients, emailSubject, emailDate]
    .forEach(element => emailCard.appendChild(element));
}

const load_email = (email) => {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-content').style.display = 'grid';

  document.querySelector('#email-content').innerHTML = '';

  fetch(`/emails/${email.id}`)
    .then(response => response.json())
    .then(email => {
      // Print email
      // console.log(email);
      display_email(email)
    });
}

const display_email = (email) => {
  const emailSender = document.createElement('div');
  const emailRecipients = document.createElement('div');
  const emailSubject = document.createElement('div');
  const emailBody = document.createElement('div');
  const emailDate = document.createElement('div');

  emailSender.id = 'sender';
  emailSender.innerHTML = email.sender;

  emailRecipients.id = 'recipient';
  emailRecipients.innerHTML = email.recipients;

  emailSubject.id = 'subject';
  emailSubject.innerHTML = email.subject;

  emailBody.id = 'body';
  emailBody.innerHTML = email.body;

  emailDate.id = 'date';
  emailDate.innerHTML = email.timestamp;

  [emailSender, emailRecipients, emailSubject, emailBody, emailDate]
    .forEach(element => document.querySelector('#email-content')
      .appendChild(element));
}