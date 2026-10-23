export interface StarMaster {
  id: number;
  SM_Code: string;
  SM_Name: string;      
  SM_NameEng: string;
}

export interface UpdateStarRequest {
  Code: string;
  Star: string;
}