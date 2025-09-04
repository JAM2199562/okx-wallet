const fs = require('fs');
const path = require('path');
const { generateMnemonic, mnemonicToSeed } = require('@okxweb3/crypto-lib/dist/bip39');
const { EthWallet } = require('@okxweb3/coin-ethereum/dist/EthWallet');
const { BtcWallet } = require('@okxweb3/coin-bitcoin/dist/wallet');
const { SolWallet } = require('@okxweb3/coin-solana/dist/SolWallet');
const { SuiWallet } = require('@okxweb3/coin-sui/dist/SuiWallet');
const { AptosWallet } = require('@okxweb3/coin-aptos/dist/AptosWallet');
const { fromSeed } = require('@okxweb3/crypto-lib/dist/bip32');
const { encode } = require('@okxweb3/coin-bitcoin/dist/wif');
const bitcoin = require('@okxweb3/coin-bitcoin/dist');

class WalletGenerator {
  constructor() {
    this.wallets = {};
  }

  // 生成助记词
  generateMnemonic() {
    // 生成12个单词的助记词
    return generateMnemonic(128);
  }

  // 从助记词派生私钥
  async derivePrivateKeyFromMnemonic(mnemonic, path, format = 'hex') {
    try {
      // 对于ed25519类型的链（如Solana、Sui和Aptos），使用不同的派生方法
      if (format === 'ed25519') {
        const { ed25519_getDerivedPrivateKey } = require('@okxweb3/crypto-lib/dist/signutil/ed25519');
        // ed25519链通常使用base58编码的私钥
        return await ed25519_getDerivedPrivateKey(mnemonic, path, true, "base58");
      }
      
      // 对于Sui，需要特殊的编码
      if (format === 'sui') {
        const { ed25519_getDerivedPrivateKey } = require('@okxweb3/crypto-lib/dist/signutil/ed25519');
        // 获取原始的十六进制私钥
        const rawPrivateKey = await ed25519_getDerivedPrivateKey(mnemonic, path, false, "hex");
        // Sui需要特殊的编码方式
        const cryptoLib = require('@okxweb3/crypto-lib');
        const suiLib = require('@okxweb3/coin-sui/dist');
        const SUI_PRIVATE_KEY_PREFIX = 'suiprivkey';
        const keypair = require('@okxweb3/coin-sui/dist/cryptography/keypair');
        
        // 编码私钥
        let bytes = cryptoLib.base.fromHex(rawPrivateKey.toLowerCase());
        if (bytes.length !== keypair.PRIVATE_KEY_SIZE) {
          throw new Error('invalid key');
        }
        const privKeyBytes = new Uint8Array(bytes.length + 1);
        privKeyBytes.set([0x00]);
        privKeyBytes.set(bytes, 1);
        return cryptoLib.base.toBech32(SUI_PRIVATE_KEY_PREFIX, privKeyBytes);
      }
      
      // 对于Aptos，需要十六进制格式的私钥
      if (format === 'aptos') {
        const { ed25519_getDerivedPrivateKey } = require('@okxweb3/crypto-lib/dist/signutil/ed25519');
        // 获取原始的十六进制私钥
        const rawPrivateKey = await ed25519_getDerivedPrivateKey(mnemonic, path, false, "hex");
        return rawPrivateKey;
      }
      
      const seed = await mnemonicToSeed(mnemonic);
      const masterNode = fromSeed(seed);
      const childNode = masterNode.derivePath(path);
      // 确保私钥是64字符的十六进制字符串
      let privateKey = childNode.privateKey.toString('hex');
      if (privateKey.startsWith('0x')) {
        privateKey = privateKey.substring(2);
      }
      // 确保私钥长度为64字符，不足的在前面补0
      while (privateKey.length < 64) {
        privateKey = '0' + privateKey;
      }
      
      // 如果需要WIF格式，则转换为WIF格式
      if (format === 'wif') {
        const privateKeyBuffer = Buffer.from(privateKey, 'hex');
        // 比特币主网的WIF版本号是0x80
        return encode(bitcoin.networks.bitcoin.wif, privateKeyBuffer, true);
      }
      
      return privateKey;
    } catch (error) {
      console.error(`派生私钥时出错 (路径: ${path}, 格式: ${format}):`, error.message);
      throw error;
    }
  }

  // 生成以太坊地址
  async generateEthereumAddress(privateKey) {
    try {
      // 确保私钥是64个字符的十六进制字符串
      const formattedPrivateKey = privateKey.length === 64 ? privateKey : privateKey.padStart(64, '0');
      const ethWallet = new EthWallet();
      const params = {
        privateKey: formattedPrivateKey
      };
      const result = await ethWallet.getNewAddress(params);
      return result;
    } catch (error) {
      console.error("以太坊地址生成失败:", error.message);
      throw error;
    }
  }

  // 生成比特币地址
  async generateBitcoinAddress(privateKey) {
    try {
      const btcWallet = new BtcWallet();
      const params = {
        privateKey: privateKey,
        addressType: "Legacy" // 可以是 "Legacy", "segwit_native", "segwit_nested", "segwit_taproot"
      };
      const result = await btcWallet.getNewAddress(params);
      return result;
    } catch (error) {
      console.error("比特币地址生成失败:", error.message);
      throw error;
    }
  }

  // 生成Solana地址
  async generateSolanaAddress(privateKey) {
    try {
      const solWallet = new SolWallet();
      const params = {
        privateKey: privateKey
      };
      const result = await solWallet.getNewAddress(params);
      return result;
    } catch (error) {
      console.error("Solana地址生成失败:", error.message);
      throw error;
    }
  }

  

  // 生成Sui地址
  async generateSuiAddress(privateKey) {
    try {
      const suiWallet = new SuiWallet();
      const params = {
        privateKey: privateKey
      };
      const result = await suiWallet.getNewAddress(params);
      return result;
    } catch (error) {
      console.error("Sui地址生成失败:", error.message);
      throw error;
    }
  }

  // 生成Aptos地址
  async generateAptosAddress(privateKey) {
    try {
      const aptosWallet = new AptosWallet();
      // Aptos需要0x前缀的私钥
      const formattedPrivateKey = privateKey.startsWith('0x') ? privateKey : '0x' + privateKey;
      const params = {
        privateKey: formattedPrivateKey
      };
      const result = await aptosWallet.getNewAddress(params);
      return result;
    } catch (error) {
      console.error("Aptos地址生成失败:", error.message);
      throw error;
    }
  }

  // 生成钱包信息
  async generateWallets() {
    try {
      console.log("正在生成助记词和地址...");
      
      // 生成助记词
      const mnemonic = this.generateMnemonic();
      
      // 为不同链派生私钥和生成地址
      const wallets = {
        mnemonic: mnemonic,
        chains: {}
      };

      // 以太坊地址生成 (使用最常见的标准路径 m/44'/60'/0'/0/0)
      const ethPrivateKey = await this.derivePrivateKeyFromMnemonic(mnemonic, "m/44'/60'/0'/0/0", 'hex');
      const ethAddress = await this.generateEthereumAddress(ethPrivateKey);
      wallets.chains.ethereum = {
        privateKey: ethPrivateKey,
        address: ethAddress.address
      };

      // 比特币地址生成 (使用最常见的标准路径 m/44'/0'/0'/0/0)
      const btcPrivateKey = await this.derivePrivateKeyFromMnemonic(mnemonic, "m/44'/0'/0'/0/0", 'wif');
      const btcAddress = await this.generateBitcoinAddress(btcPrivateKey);
      wallets.chains.bitcoin = {
        privateKey: btcPrivateKey,
        address: btcAddress.address
      };

      // Solana地址生成 (使用最常见的标准路径 m/44'/501'/0'/0')
      const solPrivateKey = await this.derivePrivateKeyFromMnemonic(mnemonic, "m/44'/501'/0'/0'", 'ed25519');
      const solAddress = await this.generateSolanaAddress(solPrivateKey);
      wallets.chains.solana = {
        privateKey: solPrivateKey,
        address: solAddress.address
      };

      

      // Sui地址生成 (使用最常见的标准路径 m/44'/784'/0'/0'/0')
      const suiPrivateKey = await this.derivePrivateKeyFromMnemonic(mnemonic, "m/44'/784'/0'/0'/0'", 'sui');
      const suiAddress = await this.generateSuiAddress(suiPrivateKey);
      wallets.chains.sui = {
        privateKey: suiPrivateKey,
        address: suiAddress.address
      };

      // Aptos地址生成 (使用最常见的标准路径 m/44'/637'/0'/0'/0')
      const aptosPrivateKey = await this.derivePrivateKeyFromMnemonic(mnemonic, "m/44'/637'/0'/0'/0'", 'aptos');
      const aptosAddress = await this.generateAptosAddress(aptosPrivateKey);
      wallets.chains.aptos = {
        privateKey: aptosPrivateKey,
        address: aptosAddress.address
      };

      return wallets;
    } catch (error) {
      console.error("生成钱包信息时出错:", error.message);
      throw error;
    }
  }

  // 保存钱包信息到文件
  saveWalletsToFile(wallets, filePath) {
    try {
      const data = JSON.stringify(wallets, null, 2);
      fs.writeFileSync(filePath, data);
      console.log(`✅ 钱包信息已保存到: ${filePath}`);
    } catch (error) {
      console.error("保存钱包信息到文件时出错:", error.message);
      throw error;
    }
  }

  // 运行程序
  async run() {
    try {
      const wallets = await this.generateWallets();
      
      // 显示生成的信息（不显示助记词）
      console.log("");
      console.log("🎉 生成的钱包信息已保存到文件，助记词不会在屏幕上显示");
      console.log("==================");
      console.log("");
      console.log("🔗 各链地址:");
      console.log(`  🔷 以太坊: ${wallets.chains.ethereum.address}`);
      console.log(`  🔘 比特币: ${wallets.chains.bitcoin.address}`);
      console.log(`  ⚡ Solana: ${wallets.chains.solana.address}`);
      console.log(`  🔱 Sui: ${wallets.chains.sui.address}`);
      console.log(`  🟣 Aptos: ${wallets.chains.aptos.address}`);
      
      // 保存到文件
      const filePath = path.join(__dirname, 'generated_wallets.json');
      this.saveWalletsToFile(wallets, filePath);
      
      console.log("");
      console.log("✅ 程序执行完成! 请查看生成的文件以获取助记词和其他信息。");
    } catch (error) {
      console.error("❌ 执行过程中出现错误:", error.message);
      process.exit(1);
    }
  }
}

// 检查是否直接运行此脚本
if (require.main === module) {
  const generator = new WalletGenerator();
  generator.run();
}

module.exports = WalletGenerator;