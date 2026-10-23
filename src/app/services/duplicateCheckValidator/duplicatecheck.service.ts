import { Injectable, inject } from '@angular/core';
// import { MasterService } from '../master/master.service';
import { Pmaster } from '../../models/pmaster.model';
import { Vmaster } from '../../models/vmaster.model';
import { Cmaster } from '../../models/cmaster.model';
import { ItemMaster } from '../../models/item-master.model';
import { VihidhamMaster } from '../../models/vihidham-master.model';
@Injectable({
  providedIn: 'root',
})
export class DuplicatecheckService {
  // private masterService=inject(MasterService)
  constructor() {}
  //pmster code check
  checkDuplicateCode(code: string, pmasterData: Pmaster[]): boolean {
    return pmasterData.some((p) => p.PM_Code == code);
  }
  //pmster name check
  checkDuplicateName(name: string, pmasterData: Pmaster[]): boolean {
    return pmasterData.some((p) => p.PM_Name === name);
  }
  //pmasterupdatenamecheck
  checkDuplicateUpdatePname(
    name: string,
    pmasterData: Pmaster[],
    code: string
  ): boolean {
    const matchingPmaster = pmasterData.find((p) => p.PM_Name === name);
    console.log(matchingPmaster);
    if (matchingPmaster) {
      return matchingPmaster.PM_Code === code;
    }

    return false;
  }
  //check regional namechck
  checkDuplicateRegionalName(name: string, pmasterData: Pmaster[]): boolean {
    return pmasterData.some((p) => p.PM_RegName === name);
  }
  //updatenameduplicatecheck
  checkDuplicateUpdateRegionalName(
    name: string,
    pmasterData: Pmaster[],
    code: string
  ): boolean {
    const matchingPmaster = pmasterData.find((p) => p.PM_RegName === name);
    console.log(matchingPmaster);
    if (matchingPmaster) {
      return matchingPmaster.PM_Code === code;
    }

    return false;
  }

//vmaster

  vmastercheckDuplicateCode(code: string, vmasterData: Vmaster[]): boolean {
    return vmasterData.some((v) => v.VM_Code == code);
  }

  vmastercheckDuplicateName(name: string, vmasterData: Vmaster[]): boolean {
    return vmasterData.some((v) => v.VM_Name === name);
  }


  vmastercheckDuplicateUpdateName(
    name: string,
    vmasterData: Vmaster[],
    code: string
  ): boolean {
    const matchingPmaster = vmasterData.find((p) => p.VM_Name === name);
    console.log(matchingPmaster);
    if (matchingPmaster) {
      return matchingPmaster.VM_Code === code;
    }

    return false;
  }
  //check regional namechck
  vmastercheckDuplicateRegionalName(name: string, vmasterData: Vmaster[]): boolean {
    return vmasterData.some((p) => p.VM_RName === name);
  }
  //updatenameduplicatecheck
  vmastercheckDuplicateUpdateRegionalName(
    name: string,
    vmasterData: Vmaster[],
    code: string
  ): boolean {
    const matchingPmaster = vmasterData.find((p) => p.VM_RName === name);
    console.log(matchingPmaster);
    if (matchingPmaster) {
      return matchingPmaster.VM_Code === code;
    }

    return false;
  }



//cmaster
  cmastercheckDuplicateCode(
    code: string,
    cmasterData: Cmaster[],

  ): boolean {
    return cmasterData.some((c) => c.VC_Code == code);
  }


  cmastercheckDuplicateUpdateCode(
    code: string,
    cmasterData: Cmaster[],id:string
  ): boolean {
    const matchingPmaster = cmasterData.find((p) => p.VC_Code === code);
    console.log(matchingPmaster);
    if (matchingPmaster) {
      return matchingPmaster.VC_ID === id;
    }

    return false;
  }

  cmastercheckDuplicateName(name: string, cmasterData: Cmaster[]): boolean {
    return cmasterData.some((c) => c.VC_Name === name);
  }
  checkDuplicateCmsterUpdatePname(
    name: string,
    cmasterDataa: Cmaster[],
    code: string
  ): boolean {
    const matchingPmaster = cmasterDataa.find((p) => p.VC_Name === name);
    console.log(matchingPmaster);
    if (matchingPmaster) {
      return matchingPmaster.VC_Code === code;
    }

    return false;
  }
  //check regional namechck
  checkDuplicateCmasterRegionalName(name: string, cmastr: Cmaster[]): boolean {
    return cmastr.some((p) => p.VC_RegName === name);
  }
  //updatenameduplicatecheck
  checkDuplicateCmasterUpdateRegionalName(
    name: string,
    cmastr: Cmaster[],
    code: string
  ): boolean {
    const matchingPmaster = cmastr.find((p) => p.VC_RegName === name);
    console.log(matchingPmaster);
    if (matchingPmaster) {
      return matchingPmaster.VC_Code === code;
    }

    return false;
  }

  itemMastercheckDuplicateCode(
    code: string,
    ImasterData: ItemMaster[]
  ): boolean {
    return ImasterData.some((I) => I.NM_Code == code);
  }

  itemMastercheckDuplicateName(
    name: string,
    pmasterData: ItemMaster[],
    code: string
  ): boolean {
    const matchingPmaster = pmasterData.find((p) => p.NM_Name === name);
    console.log(matchingPmaster);
    if (matchingPmaster) {
      return matchingPmaster.NM_Code === code;
    }

    return false;
  }
  vihidhamMastercheckDuplicateCode(
    code: string,
    vihidhamData: VihidhamMaster[]
  ): boolean {
    return vihidhamData.some((v) => v.vihidham_code == code);
  }

  vihidhamMastercheckDuplicateName(
    name: string,
    vihidhamData: VihidhamMaster[]
  ): boolean {
    return vihidhamData.some((v) => v.vihidham_name === name);
  }




  checkDuplicateuserCode(code: string, userData: any[]): boolean {
    return userData.some((u) => u.UName == code);
  }



  checkDuplicateUpdateUserName(
    name: string,
    userData: any[],
    code: number
  ): boolean {
    const matchingPmaster = userData.find((p) => p.UName === name);
    console.log(matchingPmaster);
    if (matchingPmaster) {
      return matchingPmaster.UId === code;
    }

    return false;
  }




  checkDuplicateUName(name: string, userData: any[]): boolean {
    return userData.some((p) => p.UName === name);
  }
}
