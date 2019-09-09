require('dotenv').config()

const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const nightmare = require('nightmare')()
const args = process.argv.slice(2)
const url = args[0]
const minPrice = args[1]

checkPrice()

async function checkPrice() {
	try {
		if (url == null || minPrice == null) {
			throw new Error('url and minPrice must be supplied')
		}
		const priceString = await nightmare.goto(url)
																			 .wait('#priceblock_ourprice')
																			 .evaluate(() => document.getElementById('priceblock_ourprice').innerText)
																			 .end()
		const priceNumber = priceString.replace('$', '')
		if (priceNumber <= minPrice) {
			sendEmail('Price Drop Detected!', `The price on ${url} has dropped to or below $${minPrice}`)
		}
	} catch (e) {
		sendEmail('Amazon Price Checker Error', e.message)
		throw e
	}
}

function sendEmail(subject, message) {
	const email = {
		to: 'kyle@webdevsimplified.com',
		from: 'amazon-price-checker@example.com',
		subject: subject,
		text: message,
		html: message,
	}
	sgMail.send(email)
}