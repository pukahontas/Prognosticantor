const db = require(__basedir + '/config/db.js');
const client = require('@sendgrid/client');
client.setApiKey(process.env.SENDGRID_API_KEY);

module.exports.newCall = async function (callID) {
	const newCallTemplateID = "d-39a20bfacf4142cab6ff0bd8808754d7";
	const newCallsListID = "1a326cd7-7cc3-4534-8724-e94171e52a46";
	
	const calls = await db.rows(`SELECT * FROM calls WHERE callid = '${callID}'`);
	
	if (!calls[0])
		return;
	
	const call = calls[0];
	
	const contactList = (await getContacts(newCallsListID));
	const contactEmails = contactList.contact_sample.map(({email}) => ({email}));
	console.log(contactEmails);
	
	const message = {
		name: `#${call.callid}: ${call.title}`,
		send_to: {
			list_ids: [newCallsListID]
		},
		send_at: (new Date(Date.now() + 10000)).toISOString(),
		email_config: {
			design_id: "25ce122d-19d6-47f8-9249-2c13861bf845",
			suppression_group_id: "15128",
			sender_id: "817003",
		},
	};
	
	const dyn = {
		template_id: newCallTemplateID,
		personalizations: [{
			to: contactEmails,
			dynamic_template_data: {
				title: call.title,
				description: call.description,
				permalink: "http://www.prognosticantor.com/#call-" + call.callid
			}
		}],
		from: {
			email: "natestradamus@prognosticantor.com",
			name: "Prognosticantor"
		},
		asm: {
			group_id: 15128,
		},
	};
	
	sendDynamicTemplate(dyn)
	.catch(e => {
		console.error(e);
		console.error(e.response.body.errors);
	});

}
async function getContacts (listID){
  try {
	const request = {
		method: 'GET',
		url: `/v3/marketing/lists/${listID}?contact_sample=true`,
	};
	
	return client.request(request)
	.then(([response, body]) => body)
	.catch(console.error);
	
  } catch (error) {
    console.error(error);

    if (error.response) {
      console.error(error.response.body)
    }
  }
}

async function sendDynamicTemplate (message){
  try {
	const request = {
		method: 'POST',
		url: '/v3/mail/send',
		body: message,
	};
	return client.request(request)
	.then(([response, body]) => {
		console.log(response.statusCode);
		console.log(body);
	})
  } catch (error) {
    console.error(error);

    if (error.response) {
      console.error(error.response.body)
    }
  }
}