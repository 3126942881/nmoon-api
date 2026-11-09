use base64::Engine;
use minisign_verify::{PublicKey, Signature};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args: Vec<String> = std::env::args().collect();
    if args.len() != 4 {
        return Err("Expected public-key-file signature-file installer-file".into());
    }
    let decode = |path: &str| -> Result<String, Box<dyn std::error::Error>> {
        let text = std::fs::read_to_string(path)?;
        Ok(String::from_utf8(base64::engine::general_purpose::STANDARD.decode(text.trim())?)?)
    };
    let key = PublicKey::decode(&decode(&args[1])?)?;
    let signature = Signature::decode(&decode(&args[2])?)?;
    let artifact = std::fs::read(&args[3])?;
    key.verify(&artifact, &signature, true)?;
    println!("Updater signature verified against the installed public key ({} bytes).", artifact.len());
    Ok(())
}
