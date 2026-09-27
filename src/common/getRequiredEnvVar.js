export function getRequiredEnvVar(name) {
    const value = process.env[String(name)];
    if(!value){
        throw new Error(`Missing environment variable name ${name}`)
    }

    return value;
}