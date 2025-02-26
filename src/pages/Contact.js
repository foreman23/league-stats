import React, { useState } from 'react'
import { Button, Alert } from '@mui/material'
import emailjs from '@emailjs/browser'
import CheckIcon from '@mui/icons-material/Check';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const Contact = () => {

  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);

  emailjs.init({
    publicKey: process.env.REACT_APP_EMAILJS_PUBLIC_KEY,
  });

  const sendEmail = (e) => {
    e.preventDefault();

    // Get form data
    const emailForm = document.getElementById('emailForm')

    emailjs.sendForm(process.env.REACT_APP_EMAILJS_SERVICE_ID, process.env.REACT_APP_EMAILJS_TEMPLATE_ID, emailForm)
      .then(() => {
        emailForm.reset()
        setSent(true)
        setError(false)
      }).catch((err) => {
        setError(true)
        setSent(false)
      });
  };


  return (
    <div className='contactPage'>
      <div className='contactHeader'>
        <h1>Contact</h1>
        <p>To contact us, please use the contact form below or send us an email at: <a href='mailto:riftreportgg@gmail.com'><b>riftreportgg@gmail.com</b></a></p>
      </div>
      <form onSubmit={sendEmail} id='emailForm' className='contactForm'>
        <label >Name</label>
        <input type='text' name="fname"></input>
        <label >Email</label>
        <input required type='email' name="email"></input>
        <label >Message</label>
        <textarea required name="message"></textarea>
        <Button type='submit' style={{ marginTop: '15px', backgroundColor: '#519EDD ' }} variant='contained'>Send</Button>

        {sent &&
          <Alert style={{ marginTop: '20px' }} icon={<CheckIcon fontSize="inherit" />} severity="success">
            Email sent, we'll get back to you soon!
          </Alert>
        }

        {error &&
          <Alert style={{ marginTop: '20px' }} icon={<ErrorOutlineIcon fontSize="inherit" />} severity="error">
            There was a problem sending your email, please try again.
          </Alert>
        }

      </form>
    </div>
  )
}

export default Contact