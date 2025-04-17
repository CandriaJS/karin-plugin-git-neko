import { Request, Response, Router } from 'node-karin/express'

import { Version } from '@/root'

const BaseRouter: Router = Router()

BaseRouter.get('/version', (req: Request, res: Response) => {
  res.status(200).json(
    {
      code: 200,
      message: 'success',
      data: {
        name: Version.Plugin_Name,
        version: Version.Plugin_Version
      }
    }
  )
})

export default BaseRouter
