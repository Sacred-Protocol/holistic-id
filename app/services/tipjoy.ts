//@ts-nocheck
import axios from 'axios';
import { message, result } from '@permaweb/aoconnect';
import { BigNumber } from '@ethersproject/bignumber';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck

import * as WarpArBundles from 'warp-arbundles';
/**
 * hack to get module resolution working on node jfc
 */
const pkg = WarpArBundles.default ? WarpArBundles.default : WarpArBundles;
const { createData, ArweaveSigner } = pkg;
const JOY_TOKEN = 'B803KC76yo2KRZPLCRcrnQtLG4nd-_EeEwhrhA4Wbzw';
const TOKEN_DENOMINATION = 12;

/// @ts-ignore
export function createDataItemSigner(wallet) {
    const signer = async ({ data, tags, target, anchor }) => {
        const signer = new ArweaveSigner(wallet);
        const dataItem = createData(data, signer, { tags, target, anchor });
        return dataItem.sign(signer).then(async () => ({
            id: await dataItem.id,
            raw: await dataItem.getRaw(),
        }));
    };

    return signer;
}

export async function getUserAddress(username: string): Promise<string> {
    try {
        const response = await axios.get(
            `https://sacred-api-psi.vercel.app/api/user/${username}`
        );
        return response.data.address as string;
    } catch (error) {
        console.error('Error fetching user address:', error);
        return '';
    }
}

export interface JWK {
    kty: string;
    n?: string;
    e?: string;
    d?: string;
    p?: string;
    q?: string;
    dp?: string;
    dq?: string;
    qi?: string;
}

export const sendMessage = async (
    token: string,
    tags: { name: string; value: string }[],
    data = '',
    signerJWK = ''
): Promise<string> => {
    let defaultJWK = '';

    try {
        //process.env['JWK'] might not exist if this is being called from the chrome extension
        defaultJWK = process.env['JWK'] as string;
    } catch (err) {
        console.error(err);
    }

    if (!defaultJWK && !signerJWK) {
        console.error('JWK not found');
        return '';
    }

    const jwk = JSON.parse(signerJWK || (process.env['JWK'] as string));
    try {
        const messageId = await message({
            process: token,
            tags,
            signer: createDataItemSigner(jwk) as never,
            data,
        });
        return messageId;
    } catch (error) {
        console.error('Error sending message:', error, {
            jwk,
            token,
            tags,
            data,
        });
        throw error;
    }
};

export const getDenomination = () => {
    const denominationString = TOKEN_DENOMINATION.toString();
    const denomination = denominationString
        ? parseInt(denominationString, 10)
        : 0;
    return denomination;
};

export const getBalance = async (
    address: string,
    token = 'B803KC76yo2KRZPLCRcrnQtLG4nd-_EeEwhrhA4Wbzw',
    jwk = ''
): Promise<number> => {
    const denomination = getDenomination();
    jwk = {
        kty: 'RSA',
        n: 'tjB_5BDRUJaWeoQajjMD4QBeo4pcXL1r_nv-_wr62Gog9u_9lVKvvejdN2689MSDobYY905Vy3osSOigyv0dHdLQyV-vAQQTaHMgAqEx4qy9yfJgMdhI19a6o28Rf5fzlptxRfEca9hy0z2-j6J3eJSBoQTVJwLa-eBMASefssXpqcV78OoqUqdDihyNJQhaMXJ2F52eGadOET3-thfCmIFXfV8QumeprNlmtzAMrT5ugxVIAmi6ejKn0vlU_qoh20Wnxea-S8ilme_bYJVWMNktyfqa6DqcJIOz-W92YV6Vr17QEu6DjlxE4zA79OFgT1-hb09bf1jcco_UUYh0tO0gyIDZCd80NJKIr4CbsVpA_u8kISD9wcQQczQJTFDPzry_Xv6KGvIO9WUacsaqQOYRXR9YvKSZapM1rXJmSO23pKJv7UkqDMS1eqRT0-WYMLrhBK6MCXKSbpvZkIviSGIfgyhwBzSFb4kEtbZUhXCUH2OjlCyXrpxf3d-Zk1tyY7F6hb3fc3AgBDSOgrfJ2RROtINOBCFKe8olWbUUyVqoraW8LW4MFDBmztCZP7qrsKlsPBM15YK5BE67EbrJ5IG0jVt5_ZuQq-ELYhRRgLvt3speQGbioCu7SBDmztl0tXV-PxSWM3BkteIhus-olNNGZMGCqfsKFf09w4ybxgk',
        e: 'AQAB',
        d: 'BuZMIu-1HENxBEeboYN9PoiO96Fjho_ri_9s-dfUBfKc-CUWD3vfvnDYFy4-gdmDBP0vsbFEhAMcNBBP7egLMdLcR9KzvrWFY6Oqfxb_ho6qqwAevvx_zmFqKjV9rj1BAxTfbmSSF453_hfSRJUZ8lXTbpePgp2ee9nlSaI9xMgvJW1ebdJRvdVqSXZz15wa8vubTSEnDeB9ZHSagGcNc6JAVTXkB7R_I0CMyIa4EC6IrQusXApUd5C9X3rESoGtwbn__3lnKa5kq8apjPKS3qDhlaAukiQNaj-XnFcUNAigNrw_49unB_Lmw_YoFcnG5d1LWzsK43DS0RQxLaZIicoek_ty2QYHSXjc5q9kk_8Khro7hYWsZsjuKQn7l-WDrJsR_53xc_aTuM4n9ZqKDmj6Af1DkP4LCnn3lFAkUG5wBkf4TRY8kqsOazGm8PWN805Pi_ne7TSlpZOfPOXXDgBRz_YNOXbn-paxJIxMigwqFTj1YpcnEN7AapuleOG2FtVW_UPfEuh73ea-pjP-yzv_j8OvJ68n8PS7PgTsUgSwEJFzcXp5sfSfsgN43tXSl-nFMN7i31orHxm4SX7QXjlaNorAraMhyk6P4rYqo_CROuQ6MNuQHYqdK_J_ulPuJaw8IjHNOj0Y1duNb2zsde3TJfH8YCFqf8REqoSJRnU',
        p: '67d0MgdirnSkkIuxHrfnCEziVUOhszyHcI9VCIAX7HwTfYtvS7iv1IeF9c3ZusBbM88J1XK_RlL1_ovNmxy4DG5X17_xp40rVc192bwUgBrTuYDDCon6UEOEGpzQWnnQwshvC-yJ-XhRJ3wj3DaA6X0x6BloW-2_3pKHSSvqTN1UHxbICLQuMhcIy6NpSA-m9ZH-8pJWsS_6ImttGaNeZmVBTjBDxm_APdAzTNwLD8MVZokI43xeKjgjLrscDzNcM_ufWGZLjbzDd7rhUjUTm0yptH2foWr78xpzJ1B3uILf-93oAFD2W__bFqYxEq0GrDjt-cFVpwVeqfgnFkYJvQ',
        q: 'xd3ohqxD99KVloXqSBN9V_oIOGDR0oTq3pXYQ-YvpQkMxGn0-28sPqVITawMyQHFrupRyD8iEYFbv1oJRAQZHCuLqOyk6Eb2DJK-7BWICrRlxYpp4EovSnKDQyL_HwtcI2u2lJus3uVkCd6sBdMzdsU6_hpdRQ5_Z8qrwQcsWgLHIt9inBQCC5gVVLsbgGuMiltUVVrlpW8vuxSA7nDL3h8Se6EZbai2a1KK7NkraobrheMo3SX87ZP6Bn3K-XxqVYiZeFtrULvskdS-Dle5bPC4VaxkmARfoZVMfiR-V5-OP2lnqqX34M3_5WKP0AZbm3iE2sCn0hexfuje296EPQ',
        dp: 'ieeMnXBgtXwcg0yW1Uf2bI6-o--rfLde7eWNdCms1XhJ1ttqw7xLcmXPY92JEo9TTF5GfJBjg3sp3EBii-sjanJsBheQA9y9i7drd6VnwQLw98hzU4kh3y-A7CjuZOB72Fl3TlyW5FMV96nTORTSGshaGFY1DgNsi4TijVaZ_1pFyuKDKURw-nErfigegkBWB7nglH41JfjRuK1s6OEBa5q1uE7YeBINQJy8Rq0983zI2nI1txGd7clmHALwCZycxvThZtCCR2w2V6gIBxZyYBtb9fLBH6j9ul6xHEEhqds3u506DGVRnMV1oiyc7TY5fyzXXZVUzSCBH6PFCmzzaQ',
        dq: 'NALX24auuxb8wTtkURvmZ9jOjltM7ESKJIZI-dgpD_2oAH1Fq04W2ETEE761AaVYnFj1tGh8ARP61PrK0rktDI2ZwYaq9m-ov7dXPmGOiBnRYrK2kAGQGsatIFmzrCplRt5KeRfOwiyUNk_08fcJYSAJGMA_YiakcNkCetPy4Zo3VEBaAGL2AqwwdzxTx1b982R8b49cLDdk2Y1TMtotjK6oQh0fvQaLJPzmjcmsMu1SPbhvhmo06RJrt4cbcqc0oFUu2kdVlzw-vDqq1sRSdoN0QPj23ErSBHxlRgc7urazQpHncSD9Xndn25kj6m-xZtWwPnxD4OLfgleeNTdxlQ',
        qi: '6GzbZ8_rnPzmUYsOd-XQe5_V0g3UGRVX7PIaL6XD-VNHtPw5SHrdgniOY1x53xhOc-2kxR_uAflhhX74HIa2CJ-rNqsJP-1iAfGf6qLncKgjkISqfMEcUnCnMP9UYOJ8OvVVDde6rzyyAX7AeiIBoWeRDYprZhzDdb3dEA72qmo5aCmkoQW6yJeox9NF2fe-eRRlr2-vCwoqeAbG1t08HwcrZoH1gsx6lwDTU97Wgq0xlsU67XsAo7RwxALHQa75kIFofL4o3R4IjudXToyHq8Y-vuPCkJsA2nibnB4-hRMYeaC6z2sIgwxhdCFWJvwqlDTY_AI7ecdZh2kfQCd5Ow',
    };

    const tags = [
        { name: 'Action', value: 'Balance' },
        { name: 'Recipient', value: address },
    ];
    try {
        const messageId = await sendMessage(
            token,
            tags,
            '',
            JSON.stringify(jwk)
        );
        const { Messages, Error } = await result({
            message: messageId,
            process: JOY_TOKEN,
        });
        if (Error) {
            throw new Error(Error);
        }
        const balance = BigNumber.from(Messages[0].Data)
            .div(BigNumber.from(10).pow(denomination))
            .toNumber();
        return balance;
    } catch (error) {
        console.error('Error fetching balance:', error);
        throw error;
    }
};
