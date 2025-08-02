import { server } from './app'
import { env } from './env'

server.listen(
	{
		port: env.PORT,
		host: 'RENDER' in process.env ? '0.0.0.0' : 'localhost',
	},
	(err, adrss) => {
		if (err) {
			console.error(err)
			process.exit(1)
			return
		}

		console.log(`server running at ${adrss}`)
	},
)
