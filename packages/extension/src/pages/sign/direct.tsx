import { Currency } from "@keplr-wallet/types";
import { IntlShape } from "react-intl";
import { AnyWithUnpacked, UnknownMessage } from "@keplr-wallet/cosmos";
import {
  renderMsgBeginRedelegate,
  renderMsgDelegate,
  renderMsgExecuteContract,
  renderMsgSend,
  renderMsgUndelegate,
  renderUnknownMessage,
} from "./messages";
import { Buffer } from "buffer/";
import { fromUtf8 } from "@cosmjs/encoding";
import { MsgSend } from "@keplr-wallet/proto-types/cosmos/bank/v1beta1/tx";
import {
  MsgBeginRedelegate,
  MsgDelegate,
  MsgUndelegate,
} from "@keplr-wallet/proto-types/cosmos/staking/v1beta1/tx";
import { MsgExecuteContract } from "@keplr-wallet/proto-types/cosmwasm/wasm/v1/tx";

export function renderDirectMessage(
  msg: AnyWithUnpacked,
  currencies: Currency[],
  intl: IntlShape
) {
  try {
    if (msg instanceof UnknownMessage) {
      return renderUnknownMessage(msg.toJSON());
    }

    if ("unpacked" in msg) {
      switch (msg.typeUrl) {
        case "/cosmos.bank.v1beta1.MsgSend": {
          const sendMsg = msg.unpacked as MsgSend;
          return renderMsgSend(
            currencies,
            intl,
            sendMsg.amount,
            sendMsg.toAddress
          );
        }
        case "/cosmos.staking.v1beta1.MsgDelegate": {
          const delegateMsg = msg.unpacked as MsgDelegate;
          if (delegateMsg.amount) {
            return renderMsgDelegate(
              currencies,
              intl,
              delegateMsg.amount,
              delegateMsg.validatorAddress
            );
          }
          break;
        }
        case "/cosmos.staking.v1beta1.MsgBeginRedelegate": {
          const redelegateMsg = msg.unpacked as MsgBeginRedelegate;
          if (redelegateMsg.amount) {
            return renderMsgBeginRedelegate(
              currencies,
              intl,
              redelegateMsg.amount,
              redelegateMsg.validatorSrcAddress,
              redelegateMsg.validatorDstAddress
            );
          }
          break;
        }
        case "/cosmos.staking.v1beta1.MsgUndelegate": {
          const undelegateMsg = msg.unpacked as MsgUndelegate;
          if (undelegateMsg.amount) {
            return renderMsgUndelegate(
              currencies,
              intl,
              undelegateMsg.amount,
              undelegateMsg.validatorAddress
            );
          }
          break;
        }
        case "/cosmwasm.wasm.v1.MsgExecuteContract": {
          const executeContractMsg = msg.unpacked as MsgExecuteContract;
          return renderMsgExecuteContract(
            currencies,
            intl,
            executeContractMsg.funds,
            undefined,
            executeContractMsg.contract,
            JSON.parse(fromUtf8(executeContractMsg.msg))
          );
        }
      }
    }
  } catch (e) {
    console.log(e);
  }

  return renderUnknownMessage({
    typeUrl: msg.typeUrl || "Unknown",
    value: Buffer.from(msg.value).toString("base64"),
  });
}
