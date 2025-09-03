# OKX Wallet Generator

这是一个使用 OKX Wallet SDK 生成助记词并导出多链地址的工具，专为冷钱包使用场景设计。该工具支持生成以太坊、比特币、Solana、Tron、Sui 和 Aptos 等主流区块链的地址。

## 功能特性

- 生成 BIP39 标准的 12 个单词助记词
- 支持多链地址生成：
  - 以太坊 (Ethereum)
  - 比特币 (Bitcoin)
  - Solana
  - Tron
  - Sui
  - Aptos
- 将生成的助记词和各链地址信息保存到本地 JSON 文件
- **冷钱包优化**：只保存关键信息，不记录派生路径等技术细节
- **安全改进**：不在屏幕上显示助记词，仅保存到文件中

## 安装依赖

在运行程序之前，需要安装必要的依赖包：

```bash
npm install
```

## 使用方法

运行程序以生成助记词和各链地址：

```bash
node walletGenerator.js
```

或者使用 npm 脚本：

```bash
npm run generate
# 或者
npm start
```

程序执行后，会在控制台显示各链地址（**不显示助记词**），并将详细信息保存到 `generated_wallets.json` 文件中。

## 输出示例

程序运行后会显示如下格式的信息：

```
🎉 生成的钱包信息已保存到文件，助记词不会在屏幕上显示
==================

🔗 各链地址:
  🔷 以太坊: 0x0b2e9cd0d18ee34b1c82b080edc17a25d6a481b2
  🔘 比特币: 1B3nQEhxhiqw8d9Bwch1zpZLyYNGh2LiYZ
  ⚡ Solana: 2t6RaTd8SLFqbpbqc7UDqVP6rXY5Cbrek2YbnMBzeGVy
  🔴 Tron: TBGi2xAXRH44NbgLKMPjf3M8KTs784ffrw
  🔱 Sui: 0x37c1a312db54a4911cc07a31e8149ea20a0a076aaa15cdffd1332c4e39da0fea
  🟣 Aptos: 0xadca3e364330385c7b9ca275e06e5f2bc604a6cb917459966da1543ed55443b5
```

## 生成的文件

程序会生成一个 `generated_wallets.json` 文件，包含以下关键信息：

- 助记词（用于冷钱包恢复）
- 各链的私钥
- 各链的地址

### JSON 文件结构示例：

```json
{
  "mnemonic": "hen knock love old jacket neck load business trouble atom profit comic",
  "chains": {
    "ethereum": {
      "privateKey": "6c130f01fedf0daeb58c0d40918a359ac195e0e3305020c1afb4f861a2690348",
      "address": "0x0b2e9cd0d18ee34b1c82b080edc17a25d6a481b2"
    },
    "bitcoin": {
      "privateKey": "KzfxjtBdxXzHsqt6Bw9CL1EFQ7kdm5pZTFTbjEJDHLXvakNAYDow",
      "address": "1B3nQEhxhiqw8d9Bwch1zpZLyYNGh2LiYZ"
    },
    // ... 其他链的信息
  }
}
```

## 冷钱包使用说明

1. **安全存储助记词**：将生成的助记词离线存储在安全的地方（如金属备份）
2. **验证地址**：使用生成的地址在对应链的区块链浏览器上验证是否正确
3. **测试小额转账**：在存储大额资产前，先进行小额测试转账
4. **私钥保管**：私钥具有完全控制权，请妥善保管

## 支持的区块链和标准派生路径

| 区块链 | 派生路径 | 私钥格式 | 地址格式 |
|--------|----------|----------|----------|
| 以太坊 | m/44'/60'/0'/0/0 | Hex (64字符) | 0x 前缀的十六进制地址 |
| 比特币 | m/44'/0'/0'/0/0 | WIF | P2PKH (1 开头) |
| Solana | m/44'/501'/0'/0' | Base58 | Base58 编码的地址 |
| Tron | m/44'/195'/0'/0/0 | Hex (64字符) | T 开头的 Base58 地址 |
| Sui | m/44'/784'/0'/0'/0' | Bech32 | 0x 前缀的十六进制地址 |
| Aptos | m/44'/637'/0'/0'/0' | Hex (64字符) | 0x 前缀的十六进制地址 |

## 安全提醒

1. **助记词安全**：助记词是访问钱包的唯一凭证，一旦丢失就无法恢复资产
2. **物理安全**：建议将助记词刻在金属板上，存放在安全的物理位置
3. **离线环境**：建议在完全离线的环境中运行此工具
4. **验证准确性**：使用多个钱包软件验证生成的地址是否一致
5. **小额测试**：在存储大量资产前，务必进行小额测试转账

## 技术细节

- 使用 OKX Wallet SDK 进行地址生成
- 遵循 BIP32、BIP39 和 BIP44 标准
- 支持多种私钥格式和地址格式
- 包含完整的错误处理和日志记录
- 安全设计：不在屏幕上显示敏感信息

## 许可证

本项目仅供学习和参考使用。