--获取工作记录列表

select 
  w.UserID as UserID,
  replace(u.Name,' ','') as Name,
  u.DeptCode as Department,
  w.BeginDate as Date,
  w.BeginDate as BeginDate,
  w.EndDate as EndDate,
  w.WorkContent as WorkContent,
  w.SpendHours as SpendHours,
  p.ChnName as ChnName,
  p.EngName as EngName,
  w.CheckedMan as CheckedManID,
  replace(x.Name,' ','') as CheckedManName,
  w.EffictFactorTime as Efficiency,
  w.EffictFactorDifficulty as Difficulty,
  w.EffictFactorSatisfaction as Quality,
  w.Efficiency as Factor,
  w.IsChecked as IsChecked
from WorkContents w left join UserInfo u on w.UserID = u.Account left join ProjectInfoConfig p on w.ProjectID = p.Code left join UserInfo x on w.CheckedMan = x.Account;