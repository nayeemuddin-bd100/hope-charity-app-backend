import sgMail from '@sendgrid/mail'
import config from '../config'

export const sendEmail = async (to: string, html: string) => {
  sgMail.setApiKey(config.sendgrid_api_key as string)

  const msg = {
    to,
    from: 'ctgnayeem0@gmail.com',
    subject: 'Password Reset Request',
    text: 'Change your password within 10 minutes',
    html,
  }

  try {
    await sgMail.send(msg)
  } catch (error) {
    console.log(error)
  }
}
