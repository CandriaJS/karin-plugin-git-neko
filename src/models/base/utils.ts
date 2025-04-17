import axios from 'node-karin/axios'

/**
 * 获取远程ip地址
 * @returns {Promise<string>} 远程IP
 */
const getRemoteIP = async () => {
  const urls = [
    'https://blog.cloudflare.com/cdn-cgi/trace',
    'https://developers.cloudflare.com/cdn-cgi/trace',
    'https://hostinger.com/cdn-cgi/trace',
    'https://ahrefs.com/cdn-cgi/trace'
  ]
  try {
    const response = await Promise.any(urls.map(url => axios.get(url, { responseType: 'text' })))
    const traceMap = Object.fromEntries(
      response.data.split('\n')
        .filter((line: string) => line.trim() !== '')
        .map((line: string) => line.split('='))
    )
    return traceMap.ip
  } catch (error) {
    throw new Error(`喵呜~ 获取 IP 所在地区出错: ${(error as Error).message}`)
  }
}

/**
 * 获取本地和远程的base_url
 * @returns {Promise<{ local_url: string, remote_url: string }>} base_url
 */
export async function get_base_url () {
  let local_url, remote_url
  const prefix = 'http://'
  local_url = `${prefix}${process.env.HTTP_HOST}:${process.env.HTTP_PORT}/git`
  remote_url = `${prefix}${await getRemoteIP()}:${process.env.HTTP_PORT}/git`
  return { local_url, remote_url }
}
