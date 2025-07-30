import { server } from './app'
import { env } from './env'

server.listen(
	{
		port: env.PORT,
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
