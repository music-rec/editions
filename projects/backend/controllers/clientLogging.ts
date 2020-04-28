import { Request, Response } from 'express'
// interface LogData {
//     message: string
//     timestamp: string
//     level: string
//     customMarkers: Map<string, string>
// }

// const logLogData = (logData: LogData) => {
//     console.log(logData)
// }

export const clientLoggingController = (req: Request, res: Response) => {
    console.log(req.body)

    const message = req.body.message || 'no message'

    res.send('Logged body to cloudwatch, message: ' + req.body.message)
}
