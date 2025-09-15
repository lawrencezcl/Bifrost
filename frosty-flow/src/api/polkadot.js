// Polkadot.js API 封装
import { ApiPromise, WsProvider } from '@polkadot/api';

class PolkadotApi {
  constructor() {
    this.api = null;
    this.provider = null;
  }

  // 连接到链
  async connect(rpcUrl) {
    try {
      this.provider = new WsProvider(rpcUrl);
      this.api = await ApiPromise.create({ provider: this.provider });
      
      // 监听区块
      this.api.rpc.chain.subscribeNewHeads((header) => {
        console.log(`新区块 #${header.number}`);
      });
      
      return this.api;
    } catch (error) {
      console.error('Polkadot API 连接失败:', error);
      throw error;
    }
  }

  // 监听交易状态
  async monitorTransaction(txHash, callback) {
    try {
      if (!this.api) throw new Error('API 未连接');
      
      // 监听交易状态变化
      const unsubscribe = await this.api.rpc.chain.subscribeFinalizedHeads(async (header) => {
        try {
          const blockHash = header.hash;
          const signedBlock = await this.api.rpc.chain.getBlock(blockHash);
          
          // 检查交易是否在此区块中
          const found = signedBlock.block.extrinsics.find(ext => 
            ext.hash.toString() === txHash
          );
          
          if (found) {
            callback({
              status: 'finalized',
              blockNumber: header.number.toNumber(),
              blockHash: blockHash.toString()
            });
            unsubscribe();
          }
        } catch (error) {
          console.error('监听交易失败:', error);
        }
      });
      
      return unsubscribe;
    } catch (error) {
      console.error('监听交易失败:', error);
      throw error;
    }
  }

  // 估算 Gas 费用
  async estimateGas(extrinsic, address) {
    try {
      if (!this.api) throw new Error('API 未连接');
      
      const info = await extrinsic.paymentInfo(address);
      return {
        weight: info.weight.toString(),
        partialFee: info.partialFee.toString(),
        class: info.class.toString()
      };
    } catch (error) {
      console.error('估算 Gas 失败:', error);
      throw error;
    }
  }

  // 签名并发送交易
  async signAndSend(extrinsic, signer, options = {}) {
    try {
      if (!this.api) throw new Error('API 未连接');
      
      return new Promise((resolve, reject) => {
        extrinsic.signAndSend(signer, options, ({ status, events, dispatchError }) => {
          if (status.isInBlock) {
            console.log(`交易已上链，区块哈希: ${status.asInBlock}`);
          } else if (status.isFinalized) {
            console.log(`交易已确认，区块哈希: ${status.asFinalized}`);
            
            // 检查是否有错误
            if (dispatchError) {
              if (dispatchError.isModule) {
                const decoded = this.api.registry.findMetaError(dispatchError.asModule);
                reject(new Error(`${decoded.section}.${decoded.name}: ${decoded.docs}`));
              } else {
                reject(new Error(dispatchError.toString()));
              }
            } else {
              resolve({
                hash: extrinsic.hash.toString(),
                blockHash: status.asFinalized.toString(),
                events: events.map(event => ({
                  section: event.event.section,
                  method: event.event.method,
                  data: event.event.data
                }))
              });
            }
          }
        });
      });
    } catch (error) {
      console.error('签名发送交易失败:', error);
      throw error;
    }
  }

  // 获取账户信息
  async getAccountInfo(address) {
    try {
      if (!this.api) throw new Error('API 未连接');
      
      const account = await this.api.query.system.account(address);
      return {
        nonce: account.nonce.toString(),
        data: {
          free: account.data.free.toString(),
          reserved: account.data.reserved.toString(),
          miscFrozen: account.data.miscFrozen.toString(),
          feeFrozen: account.data.feeFrozen.toString()
        }
      };
    } catch (error) {
      console.error('获取账户信息失败:', error);
      throw error;
    }
  }

  // 断开连接
  async disconnect() {
    if (this.api) {
      await this.api.disconnect();
      this.api = null;
    }
    if (this.provider) {
      await this.provider.disconnect();
      this.provider = null;
    }
  }
}

export default new PolkadotApi();