export class FaasUtil {
  static functionsUrl(url, projectId): string {
    return `https://${projectId}-daas.bfast.fahamutech.com${url}`;
  }
}
