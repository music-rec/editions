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
    const body = req.body && req.body.getReader().read()
    console.log(body)
    res.send('Logged body to cloudwatch')
}
