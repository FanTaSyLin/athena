--获取项目列表
select * from ProjectInfoConfig;

--获取项目成员列表
select 
  m.Account as Account, 
  m.ProjectID as ProjectID,
  m.IsTeamLeader as IsTeamLeader,
  replace(u.Name,' ','') as Name
from ProjectMemberConfig m left join UserInfo u on m.Account = u.Account;