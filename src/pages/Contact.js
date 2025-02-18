import React from 'react'
import { Button } from '@mui/material'

const Contact = () => {
  return (
    <div className='contactPage'>
      <div className='contactHeader'>
        <h1>Contact</h1>
        <p>To contact us, please use the contact form below or send us an email at: <b>support@gmail.com</b></p>
      </div>
      <form className='contactForm'>
        <label for="fname">Name</label>
        <input type='text' name="fname"></input>
        <label for="email">Email</label>
        <input type='email' name="email"></input>
        <label for="message">Message</label>
        <textarea name="message"></textarea>
        <Button style={{ marginTop: '15px', backgroundColor: '#519EDD ' }} variant='contained'>Send</Button>
      </form>
    </div>
  )
}

export default Contact