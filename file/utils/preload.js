const { ipcRenderer } = require('electron');

window.addEventListener('contextmenu', e => {
  e.preventDefault();
  ipcRenderer.send('menu', {  x: e.clientX, y: e.clientY });
});

WxFightHandler = {};
WxFightHandler.Private = {};
WxFightHandler.Utils = {};

WxFightHandler.Utils.GetBagPetInfos = () => document.Client.WxGetBagPetInfos();
WxFightHandler.Utils.GetBag1 = () => document.Client.WxGetBag1();
WxFightHandler.Utils.GetBag2 = () => document.Client.WxGetBag2();

WxFightHandler.Utils.ClearBag = () => new Promise(res => { WxFightHandler.Utils._as3Callback = res; document.Client.WxClearBag(); });
WxFightHandler.Utils.SetBag1 = bag1 => new Promise(res => { WxFightHandler.Utils._as3Callback = res; document.Client.WxSetBag1(bag1); });
WxFightHandler.Utils.SetBag2 = bag2 => new Promise(res => { WxFightHandler.Utils._as3Callback = res; document.Client.WxSetBag2(bag2); });
WxFightHandler.Utils.SetPetBag = async (bag1,bag2=[]) => {
  await WxFightHandler.Utils.ClearBag();
  await WxFightHandler.Utils.SetBag1(bag1);
  await WxFightHandler.Utils.SetBag2(bag2);
};

WxFightHandler.Utils.GetStoragePets = () => new Promise(resolve => {
  WxFightHandler.Utils._as3Callback = resolve;
  document.Client.WxGetStoragePets();
});

WxFightHandler.Utils.GetClothes = () => document.Client.WxGetClothes();
WxFightHandler.Utils.ChangeCloth = clothes => document.Client.WxChangeCloth(clothes);

WxFightHandler.Utils.GetTitle = () => document.Client.WxGetTitle();
WxFightHandler.Utils.SetTitle = title => document.Client.WxSetTitle(title);

WxFightHandler.Utils.CopyFire = fireType => document.Client.WxCopyFire(fireType);

WxFightHandler.Utils.RoundReset = () => WxFightHandler.Private.Round = 0;
WxFightHandler.Utils.GetRound = () => WxFightHandler.Private.Round;

WxFightHandler.Utils.ShowRound = hpPercent => { WxFightHandler.Private.Round += 1; ipcRenderer.send('set-title', `(${WxFightHandler.Private.Round}) ${hpPercent}%`); };

WxFightHandler.Utils.UseSkill = skillID => document.Client.WxUseSkill(skillID);
WxFightHandler.Utils.ChangePet = petCatchTime => document.Client.WxChangePet(petCatchTime);
WxFightHandler.Utils.UsePetItem = itemID => document.Client.WxUsePetItem(itemID);
WxFightHandler.Utils.UsePetItem10PP = () => {
  WxFightHandler.Utils.ItemBuy(300017);
  WxFightHandler.Utils.UsePetItem(300017);
};
WxFightHandler.Utils.ItemBuy = itemID => document.Client.WxItemBuy(itemID);

WxFightHandler.Utils.StopAutoFight = () => { WxFightHandler.OnFirstRound=()=>{}; WxFightHandler.OnUseSkill=()=>{}; WxFightHandler.OnChangePet=()=>{}; WxFightHandler.OnFightOver=()=>{}; };

WxFightHandler.Utils.GetFightingPetID = () => document.Client.WxGetFightingPetID();
WxFightHandler.Utils.GetFightingPetCatchTime = () => document.Client.WxGetFightingPetCatchTime();
WxFightHandler.Utils.GetFightingPets = () => document.Client.WxGetFightingPets();
WxFightHandler.Utils.ChangePetByID = ids => document.Client.WxChangePetByID(ids);

WxFightHandler.Utils.Delay = ms => new Promise(resolve => setTimeout(resolve,ms));

WxFightHandler.Utils.Send = (commandID, ...args) => document.Client.WxSend(commandID,...args);
WxFightHandler.Utils.SendAsync = (commandID,parameterArray) => new Promise(resolve => {
  WxFightHandler.Utils._as3Callback = resolve;
  document.Client.WxSendWithCallback2(commandID,parameterArray);
});

WxFightHandler.Utils.GetItemNameByID = itemID => document.Client.WxGetItemNameByID(itemID);
WxFightHandler.Utils.GetAllCloth = () => document.Client.WxGetAllCloth();
WxFightHandler.Utils.GetPetNameByID = petID => document.Client.WxGetPetNameByID(petID);
WxFightHandler.Utils.GetSkillNameByID = skillID => document.Client.WxGetSkillNameByID(skillID);
WxFightHandler.Utils.GetItemNumByID = itemID => document.Client.WxGetItemNumByID(itemID);

WxFightHandler.Utils.AutoFight = id => document.Client.WxAutoFight(id);

WxFightHandler.Utils.SetIsAutoCure = cure => cure ? document.Client.WxAutoCureStart() : document.Client.WxAutoCureStop();
WxFightHandler.Utils.CurePet20HP = () => document.Client.WxCurePet20HP();
WxFightHandler.Utils.CurePetAll = () => document.Client.WxCurePetAll();
WxFightHandler.Utils.LowHP = () => document.Client.WxLowHP();
WxFightHandler.Utils.SimpleAlarm = msg => document.Client.WxSimpleAlarm(msg);
WxFightHandler.Utils.Alarm = msg => document.Client.WxAlarm(msg);
