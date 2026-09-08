declare module '@/site.config.mjs' {
  const config: {
    name: string
    url: string
    contentDir: string
    logo: string
    imageMaxWidth: number
    coverMaxWidth: number
  }
  export default config
}
