import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'kgwfenp9'
    const apiKey = process.env.CLOUDINARY_API_KEY || '714277892892322'
    const apiSecret = process.env.CLOUDINARY_API_SECRET || 'Vmky0_x91fCBJPSMHSHlUQSqnUo'
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'mwijay_preset'

    // Convert file to base64 or buffer for Cloudinary API upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64Data = `data:${file.type};base64,${buffer.toString('base64')}`

    // Determine resource_type (image or video or auto)
    const resourceType = file.type.startsWith('video/') ? 'video' : 'auto'

    // Timestamp for signature
    const timestamp = Math.floor(Date.now() / 1000)

    // Call Cloudinary API
    const cloudinaryFormData = new FormData()
    cloudinaryFormData.append('file', base64Data)
    cloudinaryFormData.append('upload_preset', uploadPreset)
    cloudinaryFormData.append('api_key', apiKey)
    cloudinaryFormData.append('timestamp', timestamp.toString())

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
      method: 'POST',
      body: cloudinaryFormData,
    })

    const data = await res.json()

    if (!res.ok) {
      // Fallback unsigned / auto upload attempt
      const fallbackFormData = new FormData()
      fallbackFormData.append('file', base64Data)
      fallbackFormData.append('upload_preset', 'ml_default')

      const fallbackRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: 'POST',
        body: fallbackFormData,
      })

      const fallbackData = await fallbackRes.json()

      if (!fallbackRes.ok) {
        return NextResponse.json({ error: data.error?.message || fallbackData.error?.message || 'Cloudinary upload failed' }, { status: 500 })
      }

      return NextResponse.json({
        url: fallbackData.secure_url,
        public_id: fallbackData.public_id,
        resource_type: fallbackData.resource_type,
        format: fallbackData.format,
      })
    }

    return NextResponse.json({
      url: data.secure_url,
      public_id: data.public_id,
      resource_type: data.resource_type,
      format: data.format,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error uploading to Cloudinary' }, { status: 500 })
  }
}
