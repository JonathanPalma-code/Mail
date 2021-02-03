window.addEventListener('popstate', (e) => {
  const data = e.state;
  if (!data) {
    load_mailbox('inbox');
  } else {
    load_email(data.email)
    // console.log('Worked!', data.email);
  }
})

document.addEventListener('DOMContentLoaded', () => {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector('#compose-form').onsubmit = send_email

  // By default, load the inbox
  load_mailbox('inbox');
});

const compose_email = () => {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-content').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

const load_mailbox = (mailbox) => {

  let countEmail = 0;

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
      emails.forEach(email => {
        display_mailbox(mailbox, email);
        if (email.read) {
          changeBackground = document.getElementsByClassName('email-card');
          changeBackground[countEmail].style.backgroundColor = '#e2e2e2';
          changeBackground[countEmail].style.fontWeight = 'normal';
        }
        countEmail++;
      })
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
  setTimeout(() => load_mailbox('sent'), 500);
  return false;
}

const display_mailbox = (mailbox, email) => {

  const emailCard = document.createElement('div');
  emailCard.className = 'email-card';

  document.getElementById('emails-view').appendChild(emailCard);

  const emailInfo = document.createElement('a');
  emailInfo.className = 'email-info';
  emailInfo.addEventListener('click', () => {
    load_email(email)
    history.pushState({ 'mailbox': mailbox, 'email': email }, '', `email=${email.subject}`)
    // console.log(history.state)
  });

  const emailRecipients = document.createElement('div');
  emailRecipients.className = 'email-owner';

  const emailSubject = document.createElement('div');
  emailSubject.className = 'email-subject';
  emailSubject.innerHTML = email.subject;

  const emailDate = document.createElement('div');
  emailDate.className = 'email-date';
  emailDate.innerHTML = email.timestamp;


  [emailRecipients, emailSubject, emailDate]
    .forEach(element => emailInfo.appendChild(element));

  emailCard.appendChild(emailInfo);

  if (mailbox === 'sent') {
    emailRecipients.innerHTML = email.recipients; // slice from a number of characters
    emailRecipients.innerHTML = emailRecipients.innerHTML.slice(0, 20) + '...';
    emailRecipients.title = email.recipients.toString();
    // emailRecipients.title = 
  } else {
    const emailArchived = document.createElement('button');
    emailArchived.className = 'email-archived';
    emailRecipients.innerHTML = email.sender;
    emailArchived.title = 'Archive';
    emailArchived.addEventListener('click', () => {
      archived(email);
      emailCard.style.animationPlayState = 'running';
      setTimeout(() => load_mailbox('inbox'), 500);
    });
    emailCard.style.gridTemplateColumns = '95% 5%';

    emailCard.appendChild(emailArchived);

    if (mailbox === 'archive') {
      emailArchived.style.background = "url('./static/mail/logo/undo.png')";
      emailArchived.style.backgroundPosition = "center";
      emailArchived.style.backgroundRepeat = "no-repeat";
      emailArchived.style.backgroundSize = "contain";
      emailArchived.title = 'Unarchive';
    }
  }

}

const archived = (email) => {
  if (!email.archived) {
    fetch(`emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: true
      })
    })
  } else {
    fetch(`emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: false
      })
    });
  }
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

  fetch(`emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  });
}

const display_email = (email) => {
  const emailSender = document.createElement('div');
  const emailRecipients = document.createElement('div');
  const emailSubject = document.createElement('div');
  const emailBody = document.createElement('div');
  const emailDate = document.createElement('div');
  const replyButton = document.createElement('button');

  emailSender.id = 'sender';
  emailSender.innerHTML = email.sender;

  emailRecipients.id = 'recipient';
  emailRecipients.innerHTML = email.recipients;

  emailSubject.id = 'subject';
  emailSubject.innerHTML = email.subject;

  emailBody.id = 'body';
  emailBody.innerHTML = email.body;
  emailBody.innerHTML = emailBody.innerHTML.replace('\n', '<br>');
  emailBody.style.whiteSpace = 'pre';

  emailDate.id = 'date';
  emailDate.innerHTML = email.timestamp;

  replyButton.id = 'reply-btn';
  replyButton.innerHTML = 'Reply';
  replyButton.className = 'btn btn-sm btn-primary ';

  [emailSender, emailRecipients, emailSubject, emailBody, emailDate, replyButton]
    .forEach(element => document.querySelector('#email-content')
      .appendChild(element));

  replyButton.addEventListener('click', () => {
    reply(email)
  })
}

const reply = (email) => {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-content').style.display = 'grid';

  document.querySelector('#compose-recipients').value = email.sender;
  if (email.subject.indexOf('Re:') > -1) {
    document.querySelector('#compose-subject').value = email.subject;
  } else {
    document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
  }
  document.querySelector('#compose-body').value = `\n\n------- On ${email.timestamp}, ${email.sender} wrote:\n${email.body}`;
}
