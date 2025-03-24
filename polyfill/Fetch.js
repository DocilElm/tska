import { Promise } from "./Promise"

const OutputStreamWriter = Java.type("java.io.OutputStreamWriter")
const GZIPInputStream = Java.type("java.util.zip.GZIPInputStream")
const BufferedReader = Java.type("java.io.BufferedReader")
const InputStreamReader = Java.type("java.io.InputStreamReader")
const URLEncoder = Java.type("java.net.URLEncoder")
const ByteArrayOutputStream = Java.type("java.io.ByteArrayOutputStream")
const DataOutputStream = Java.type("java.io.DataOutputStream")
const URLConnection = Java.type("java.net.URLConnection")
const Files = Java.type("java.nio.file.Files")

/**
 * - Opens a java HttpsURLConnection with the SSL factory that handles https
 * @param {string} url The url to open the connection with
 * @returns {HttpsURLConnection} HttpsURLConnection
 */
export const getConnection = (url) => com.chattriggers.ctjs.CTJS.INSTANCE.makeWebRequest(url)

const makeQueryString = (obj) => {
    const keys = Object.keys(obj)
    let str = ""

    for (let k of keys) {
        let v = obj[k]
        if (str.length > 0) str += "&"

        str += `${URLEncoder.encode(k, "UTF-8")}=${URLEncoder.encode(v, "UTF-8")}`
    }

    return str
}

const makeMultiPartBody = (obj, boundary) => {
    const byteStream = new ByteArrayOutputStream()
    const outputStream = new DataOutputStream(byteStream)
    const keys = Object.keys(obj)

    for (let k of keys) {
        let v = obj[k]

        outputStream.writeBytes(`--${boundary}\r\n`)

        if (!("file" in v)) {
            outputStream.writeBytes(`Content-Disposition: form-data; name="${k}"\r\n\r\n`)
            outputStream.writeBytes(`${v}\r\n`)
            continue
        }

        /** @type {JavaTFile} */
        let file = new (java.io.File)(v.file)
        let fileName = file.getName()
        let byteArray = Files.readAllBytes(file.toPath())
        let mimeType = URLConnection.guessContentTypeFromName(v.file)

        outputStream.writeBytes(`Content-Disposition: form-data; name="${k}"; filename="${fileName}"\r\n`)
        outputStream.writeBytes(`Content-Type: ${mimeType}\r\n\r\n`)
        outputStream.write(byteArray)
        outputStream.writeBytes(`\r\n`)
    }

    outputStream.writeBytes(`--${boundary}--\r\n`)
    outputStream.close()

    return byteStream.toByteArray()
}

const handlePost = (connection, opts) => {
    let streamWriter = null
    let dataToWrite = null

    if ("body" in opts) {
        connection.setRequestProperty("Content-Type", "application/json; charset=UTF-8")
        dataToWrite = JSON.stringify(opts.body)
    }

    if ("form" in opts) {
        const qs = makeQueryString(opts.form)
        const bytes = new (java.lang.String)(qs).getBytes("UTF-8")

        connection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded")
        connection.setRequestProperty("Content-Length", bytes.length.toString())

        dataToWrite = bytes
    }

    if ("multipart" in opts) {
        const boundary = java.util.UUID.randomUUID().toString()
        const body = makeMultiPartBody(opts.multipart, boundary)

        connection.setRequestProperty("Content-Type", `multipart/form-data; boundary=${boundary}`)
        connection.setRequestProperty("Content-Length", body.length)

        dataToWrite = body
    }

    // If no data to write is provided we fall back out
    if (!dataToWrite) return

    try {
        streamWriter = new OutputStreamWriter(connection.getOutputStream())
        streamWriter.write(dataToWrite)
    } catch (error) {
        print(error)
    } finally {
        streamWriter?.close()
    }
}

/**
 * @typedef {object} opts
 * @prop {"GET"|"POST"|"PUT"|"OPTIONS"|"DELETE"} method The method of the request (`GET` by default)
 * @prop {number} timeout The timeout time in milliseconds (`0` by default)
 * @prop {number} readTimeout The read timeout time in milliseconds (`0` by default)
 * @prop {boolean} followRedirect Whether to follow the request's redirect or not (`true` by default)
 * @prop {object} headers The headers object this request will use
 * @prop {boolean} json Whether to automatically call `JSON.parse()` in the contents or not (`false` by default)
 * @prop {boolean} fullResponse Whether the content result should have the "full" response
 * @prop {any} body The body contents to send to the request
 * @prop {any} form The form contents to send to the request
 * @prop {any} multipart The multipart contents to send to the request
 * i.e. `{ status: status, message: responseMessage, headers: header, body: content }` (`false` by default)
 */

/**
 * - Makes a request with the given params
 * - Note: This does not set up a `Promise` and neither does it return one.
 * @template T
 * @param {opts} opts The options to use for this request
 * @param {(value: ...T)} resolve
 * @param {(reason: ...any)} reject
 * @returns
 */
export const request = (opts, resolve, reject) => {
    if (!opts.url) return reject("No url parameter specified in #request")

    opts.method = opts.method?.toUpperCase()?.trim() ?? "GET"
    opts.timeout = opts.timeout ?? 0
    opts.readTimeout = opts.readTimeout ?? opts.timeout
    opts.followRedirect = opts.followRedirect ?? true
    opts.headers = opts.headers ?? {}
    opts.json = opts.json ?? false
    opts.fullResponse = opts.fullResponse ?? false

    new Thread(() => {
        try {
            const connection = getConnection(opts.url)
            connection.setRequestMethod(opts.method)
            connection.setDoOutput(true)
            connection.setConnectTimeout(opts.timeout)
            connection.setReadTimeout(opts.readTimeout ?? opts.timeout)
            connection.setInstanceFollowRedirects(opts.followRedirect)
            connection.setRequestProperty("Accept-Encoding", "gzip")
    
            let headers = Object.keys(opts.headers)
            for (let k of headers) {
                connection.setRequestProperty(k, opts.headers[k])
            }

            if (opts.method === "POST" || opts.method === "PUT") handlePost(connection, opts)

            const status = connection.getResponseCode()
            if (opts.method === "OPTIONS") {
                const headerField = connection.getHeaderFields()
                const entrySet = headerField.entrySet()

                headers = {}
                for (let entry of entrySet) {
                    headers[entry.getKey()] = entry.getValue()
                }
            }

            let stream = status > 299 ? connection.getErrorStream() : connection.getInputStream()

            if (connection.getContentEncoding() === "gzip")
                stream = new GZIPInputStream(stream)

            const contentType = connection.getHeaderField("Content-Type")
            const isUTF8 = contentType.includes("application/json") || contentType.includes("charset=UTF-8")
            const bfreader = new BufferedReader(isUTF8 ? new InputStreamReader(stream, "UTF-8") : new InputStreamReader(stream))
            let content = ""

            while (true) {
                let line = bfreader.readLine()
                if (!line) break

                content += line
            }

            bfreader.close()
            connection.disconnect()

            if (status > 299) return reject(`status code was over 299 (${status}) content: \"${content}\"`)
            if (opts.fullResponse) content = {
                status: status,
                message: connection.getResponseMessage(),
                headers,
                body: content
            }

            resolve(opts.json ? JSON.parse(content) : content)
        } catch (error) {
            reject(error)
        }
    }).start()
}

/**
 * - Fetch-like api to making requests
 * - Note: This returns a promise unlike node-fetch so no helper methods can be used in the `response`
 * @template T
 * @param {string} url The url to make the request to
 * @param {opts} opts The options to use for this request
 * @returns {import("./Promise").Promise<T>}
 */
export const fetch = (url, opts = {}) => {
    opts.url = url
    return new Promise((resolve, reject) => request(opts, resolve, reject))
}