import {TransactionsExplorer} from "../model/TransactionsExplorer";
import {Wallet, WalletOptions} from "../model/Wallet";
import {Mnemonic} from "../model/Mnemonic";
import {Transaction} from "../model/Transaction";

//bridge for cnUtil with the new mnemonic class
(<any>self).mn_random = Mnemonic.mn_random;
(<any>self).mn_decode = Mnemonic.mn_decode;
(<any>self).mn_encode = Mnemonic.mn_encode;

let currentWallet : Wallet|null = null;

onmessage = function(data : MessageEvent){
	// if(data.isTrusted){
		let event : any = data.data;
		if(event.type === 'initWallet'){
			currentWallet = Wallet.loadFromRaw(event.wallet);
			postMessage('readyWallet');
		}else if (event.type === 'process'){
			if(typeof event.wallet !== 'undefined'){
				currentWallet = Wallet.loadFromRaw(event.wallet);
			}

			if(currentWallet === null){
				postMessage('missing_wallet');
				return;
			}

			let rawTransactions : RawDaemonTransaction[] = event.transactions;
            let transactions: any[] = [];
            
			for(let rawTransaction of rawTransactions){
                let transaction = TransactionsExplorer.parse(rawTransaction, currentWallet);
				if(transaction !== null){
                    currentWallet.addNew(transaction);
                    //if (transaction.getAmount() !== 0) //fusion
                    //{
                        transactions.push(transaction.export());
                    //}
				}
			}

			postMessage({
				type:'processed',
				transactions:transactions
			});
		}
		// let transaction = TransactionsExplorer.parse(rawTransaction, height, this.wallet);
	// }else {
	// 	console.warn('Non trusted data', data.data, JSON.stringify(data.data));
	// }
};

postMessage('ready');