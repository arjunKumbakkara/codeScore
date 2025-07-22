import React, { useState } from 'react';
import { Database, Table, ChevronDown, ChevronRight, Eye, BarChart3, Code, AlertCircle } from 'lucide-react';

interface SQLInputProps {
  onSQLSubmit: (query: string, tableStructures: string, dataVolume: string) => void;
  loading: boolean;
}

interface TableInfo {
  name: string;
  createScript: string;
  dataVolume: string;
  description: string;
}

export const SQLInput: React.FC<SQLInputProps> = ({ onSQLSubmit, loading }) => {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [expandedTable, setExpandedTable] = useState<string | null>(null);

  // Predefined table structures
  const tableStructures: TableInfo[] = [
    {
      name: 'M2M_INVENTORY_MASTER',
      description: 'Master table for M2M device inventory management',
      createScript: `CREATE TABLE \`M2M_INVENTORY_MASTER\` (
  \`ID\` int NOT NULL AUTO_INCREMENT,
  \`SIM_PRODUCT_ID\` varchar(20) DEFAULT NULL,
  \`SIM_ID\` decimal(20,0) DEFAULT NULL,
  \`ICCID\` decimal(20,0) DEFAULT NULL,
  \`IMSI\` decimal(20,0) DEFAULT NULL,
  \`MSISDN\` decimal(20,0) DEFAULT NULL,
  \`STOCK_CHECK_IN_DATE\` datetime DEFAULT NULL,
  \`SIM_ATTACH_STATUS\` varchar(10) DEFAULT '0',
  \`IMEI\` varchar(55) DEFAULT NULL,
  \`SKU_ID\` varchar(20) DEFAULT NULL,
  \`LOCATION\` varchar(55) DEFAULT NULL,
  \`IP_ADDRESS\` varchar(10) DEFAULT NULL,
  \`LIFECYCLE_STATUS\` varchar(5) DEFAULT NULL,
  \`ACTIVATION_DATE\` datetime DEFAULT NULL,
  \`SERVICE_PLAN\` varchar(20) DEFAULT NULL,
  \`SOFT_DELETE\` varchar(5) DEFAULT '0',
  \`ORDER_PLACE_FLAG\` varchar(10) DEFAULT '0',
  \`ORDER_ID\` varchar(55) DEFAULT NULL,
  \`BICS_OUTPUT_CONTAIN_FLAG\` varchar(5) DEFAULT '0',
  \`REAL_SMSC\` varchar(55) DEFAULT NULL,
  \`ALIAS_SMSC\` varchar(55) DEFAULT NULL,
  \`PIN_1\` varchar(55) DEFAULT NULL,
  \`PUK_1\` varchar(55) DEFAULT NULL,
  \`PIN_2\` varchar(55) DEFAULT NULL,
  \`PUK_2\` varchar(55) DEFAULT NULL,
  \`KI\` varchar(55) DEFAULT NULL,
  \`ACC\` varchar(55) DEFAULT NULL,
  \`ADM_2\` varchar(55) DEFAULT NULL,
  \`ACCOUNT_ID\` varchar(70) DEFAULT NULL,
  \`STATIC_IP\` varchar(50) DEFAULT NULL,
  \`DEACTIVATION_DATE\` datetime DEFAULT NULL,
  \`SPONSOR_ID\` varchar(300) DEFAULT NULL,
  \`ADM_1\` varchar(45) DEFAULT NULL,
  \`OPC\` varchar(45) DEFAULT NULL,
  \`SPONSOR_IMSI\` varchar(400) DEFAULT NULL,
  \`PREVIOUS_SERVICE_STATUS\` varchar(5) DEFAULT NULL,
  \`ENDUSER_CUSTOMER_ID\` decimal(20,0) DEFAULT NULL,
  \`ENDUSER_NAME\` varchar(155) DEFAULT NULL,
  \`SIM_TRANSFER_STATUS\` int DEFAULT '0',
  \`BICS_TESTPLAN_ID\` varchar(255) DEFAULT NULL,
  \`LAST_SIM_STATE_CHANGE_DATE\` timestamp NULL DEFAULT NULL,
  \`TEXT_QR_CODE\` varchar(200) DEFAULT NULL,
  \`SMDP_PLUS_ADDRESS\` varchar(155) DEFAULT NULL,
  \`MATCHING_ID\` varchar(155) DEFAULT NULL,
  \`TIMESTAMP_SINCE_SIM_NOT_ACTIVATED\` json DEFAULT NULL,
  \`EID\` decimal(40,0) DEFAULT NULL,
  \`SMDPPLUSPROFILETYPE\` varchar(55) DEFAULT NULL,
  \`RSP_PROFILE_STATUS\` varchar(10) DEFAULT 'enabled',
  \`RSP_STATE\` varchar(55) DEFAULT NULL,
  \`IS_FALLBACK\` tinyint(1) DEFAULT NULL,
  \`Profile_Type\` varchar(10) DEFAULT NULL,
  PRIMARY KEY (\`ID\`),
  KEY \`MSISDN\` (\`MSISDN\`),
  KEY \`ICCID\` (\`ICCID\`),
  KEY \`ENDUSER_NAME_IDX\` (\`ENDUSER_NAME\`),
  KEY \`IMSI_IDX\` (\`IMSI\`),
  KEY \`SOFT_DELETE_IDX\` (\`SOFT_DELETE\`),
  KEY \`ACCOUNT_IDX\` (\`ACCOUNT_ID\`),
  KEY \`ENDUSER_CUSTOMER_ID_IDX\` (\`ENDUSER_CUSTOMER_ID\`),
  KEY \`idx_eid\` (\`EID\`),
  KEY \`IDX1\` (\`SOFT_DELETE\`,\`SIM_TRANSFER_STATUS\`,\`ACCOUNT_ID\`),
  KEY \`IDX2\` (\`ICCID\`,\`ACCOUNT_ID\`)
);`,
      dataVolume: `Current Production Load:
• Total Records: 9,945,657 records
• Active Devices: 38,450 (85%)
• Inactive Devices: 4,120 (9%)
• Under Maintenance: 2,180 (5%)
• Retired Devices: 480 (1%)

Data Growth Pattern:
• Monthly Growth: ~1,200 new devices
• Peak Usage: Business hours (9 AM - 6 PM)
• Storage Size: 12.5 MB
• Index Size: 3.2 MB

Performance Metrics:
• Most Queried Columns: STATUS, DEVICE_TYPE, LOCATION_CODE
• Last Maintenance: 2024-12-15`
    },
    {
      name: 'M2M_SUBSCRIBER_INFO',
      description: 'Subscriber information for M2M services',
      createScript: `CREATE TABLE \`CBS_SUBSCRIBER_INFO\` (
  \`MSISDN\` bigint DEFAULT NULL,
  \`SubscriberID\` varchar(30) NOT NULL,
  \`PlanID\` varchar(35) DEFAULT NULL,
  \`OCExpiryDate\` datetime DEFAULT NULL,
  \`CurrentStatus\` varchar(3) DEFAULT NULL,
  \`PostpaidCurrentStatus\` varchar(3) DEFAULT NULL,
  \`FirstCallDate\` datetime DEFAULT NULL,
  \`FirstRechargeDate\` datetime DEFAULT NULL,
  \`DefaultPlanID\` varchar(35) DEFAULT NULL,
  \`CreationDate\` datetime DEFAULT NULL,
  \`IsSMSAllowed\` varchar(5) DEFAULT NULL,
  \`IsOCAllowed\` varchar(5) DEFAULT NULL,
  \`IsTCAllowed\` varchar(5) DEFAULT NULL,
  \`IsPCNAllowed\` varchar(5) DEFAULT NULL,
  \`IsInternationalRoaming\` varchar(5) DEFAULT NULL,
  \`IsCallConf\` varchar(5) DEFAULT NULL,
  \`IsSTDAllowed\` varchar(5) DEFAULT NULL,
  \`IsISDAllowed\` varchar(5) DEFAULT NULL,
  \`IsSmsSTDAllowed\` varchar(5) NOT NULL DEFAULT 'false',
  \`IsSmsISDAllowed\` varchar(5) NOT NULL DEFAULT 'false',
  \`IsFirstCallPassed\` varchar(5) DEFAULT NULL,
  \`IsGPRSAllowed\` varchar(5) DEFAULT NULL,
  \`DefaultLanguage\` int DEFAULT NULL,
  \`Currency\` int DEFAULT NULL,
  \`PreviousStatus\` varchar(3) DEFAULT NULL,
  \`Gp1Date\` datetime DEFAULT NULL,
  \`Gp2Date\` datetime DEFAULT NULL,
  \`PlanExpiryDate\` datetime DEFAULT NULL,
  \`MvnoId\` bigint NOT NULL,
  \`AreaID\` int DEFAULT NULL,
  \`SubscriberType\` int DEFAULT NULL,
  \`SIMExpiryDate\` datetime DEFAULT NULL COMMENT 'LASTSIMSTATECHANGEDATE',
  \`IMSI\` decimal(20,0) DEFAULT NULL,
  \`IsCUGEnabled\` varchar(5) DEFAULT NULL,
  \`CountryCode\` int DEFAULT NULL,
  \`EmailId\` varchar(50) DEFAULT NULL,
  \`DeactivationDate\` datetime DEFAULT NULL,
  \`SuspensionDate\` datetime DEFAULT NULL,
  \`IsSmsMTAllowed\` varchar(5) DEFAULT NULL,
  \`IsRoamingDataAllowed\` varchar(5) DEFAULT NULL,
  \`NextBillingDate\` datetime DEFAULT NULL,
  \`CreditLimit\` varchar(20) DEFAULT NULL,
  \`IncomingCallAllowedInIntlRoaming\` varchar(5) DEFAULT NULL,
  \`OutgoingCallAllowedInIntlRoaming\` varchar(5) DEFAULT NULL,
  \`IncomingSMSAllowedInIntlRoaming\` varchar(5) DEFAULT NULL,
  \`OutgoingSMSAllowedInIntlRoaming\` varchar(5) DEFAULT NULL,
  \`Reason\` varchar(20) DEFAULT NULL,
  \`ParentEntityId\` bigint DEFAULT NULL,
  \`IMEI\` varchar(50) DEFAULT NULL,
  \`CustomerType\` int DEFAULT NULL,
  \`InstanceId\` int DEFAULT NULL,
  \`PlanChangeDate\` datetime DEFAULT NULL,
  \`TimeZone\` int DEFAULT NULL,
  \`TierId\` int DEFAULT NULL,
  \`IsGSM\` varchar(5) DEFAULT 'false',
  \`IsCDMA\` varchar(5) DEFAULT 'false',
  \`IsLTE\` varchar(5) DEFAULT 'false',
  \`IsUMTS\` varchar(5) DEFAULT 'false',
  \`IsNRSecondary\` varchar(5) DEFAULT 'false',
  \`CustomerName\` varchar(60) DEFAULT NULL,
  \`OnBoardType\` int DEFAULT NULL,
  \`LaunchDate\` datetime DEFAULT NULL,
  \`RoamingProfileId\` varchar(200) DEFAULT NULL,
  \`PDPProfileId\` varchar(30) DEFAULT NULL,
  \`APN\` varchar(150) DEFAULT NULL,
  \`BlockFlag\` varchar(5) DEFAULT NULL,
  \`CustomerCode\` varchar(50) DEFAULT NULL,
  \`StaticIP\` varchar(50) DEFAULT NULL,
  \`CustomerExpiryDate\` datetime DEFAULT NULL,
  \`EndUserCurrencyId\` int DEFAULT NULL,
  \`SequenceId\` bigint DEFAULT NULL,
  \`YCode\` varchar(50) DEFAULT NULL,
  \`ICCID\` decimal(20,0) DEFAULT NULL,
  \`UsageCost\` decimal(20,9) DEFAULT NULL,
  \`CustomTariff\` varchar(5) DEFAULT NULL,
  \`ImeiLock\` varchar(5) DEFAULT NULL,
  \`AEnd\` varchar(200) DEFAULT NULL COMMENT 'BasePlanRoamingProfileIdsListAlone',
  \`IsDetached\` varchar(5) DEFAULT NULL,
  \`ActiveSession\` varchar(5) DEFAULT 'F-1',
  \`IsNBIOT\` varchar(5) DEFAULT NULL,
  \`IsDelinkSim\` varchar(5) DEFAULT 'false',
  \`IsNegative\` varchar(5) DEFAULT 'false',
  \`PayLaterActFee\` varchar(5) DEFAULT NULL,
  \`IsDynamicBenefitEnable\` varchar(5) DEFAULT 'false',
  \`EndPointCount\` int DEFAULT NULL,
  \`ChargeExpiryDate\` datetime DEFAULT NULL,
  \`isFirstUse\` varchar(5) DEFAULT 'false',
  \`ActivateByUsageDate\` datetime DEFAULT NULL,
  \`BlockStatus\` varchar(1) DEFAULT '0',
  \`IsOemEnable\` varchar(5) DEFAULT 'false',
  \`TestPlanId\` varchar(30) DEFAULT NULL,
  \`InventoryPlanId\` varchar(30) DEFAULT NULL,
  \`activatedByFirstUse\` varchar(5) DEFAULT 'false',
  \`PhaseChangeExpiryDate\` datetime DEFAULT NULL,
  \`isUsageDone\` varchar(5) DEFAULT 'false' COMMENT 'Flag to identify endpoint usage by sms or data is done',
  \`ShortCode\` varchar(10) DEFAULT NULL,
  \`ValueAddedFeature\` varchar(20) DEFAULT NULL,
  \`IsDataUsageDone\` varchar(8) DEFAULT NULL,
  \`IsNboitUsageDone\` varchar(8) DEFAULT NULL,
  \`IsLtemUsageDone\` varchar(8) DEFAULT NULL,
  \`IsLTEMAllowed\` varchar(5) DEFAULT NULL,
  \`Account_with_EID\` varchar(8) DEFAULT NULL,
  \`EID\` decimal(40,0) DEFAULT NULL,
  \`RspState\` varchar(55) DEFAULT NULL,
  \`SponsorName\` varchar(50) DEFAULT NULL,
  \`SponsorId\` varchar(50) DEFAULT NULL,
  \`ChildResellerEnabled\` tinyint DEFAULT NULL,
  \`NoOfUsersPerCustomer\` tinyint DEFAULT NULL,
  \`eSimProfileStatus\` varchar(10) DEFAULT NULL,
  PRIMARY KEY (\`MvnoId\`),
  KEY \`idx1\` (\`MSISDN\`,\`CurrentStatus\`,\`PostpaidCurrentStatus\`,\`InstanceId\`,\`ParentEntityId\`,\`TierId\`,\`IMSI\`),
  KEY \`MSISDN\` (\`MSISDN\`),
  KEY \`grpIdx2\` (\`ParentEntityId\`,\`MSISDN\`,\`TierId\`,\`PostpaidCurrentStatus\`,\`CurrentStatus\`,\`isFirstUse\`),
  KEY \`grpIdx5\` (\`ParentEntityId\`,\`PostpaidCurrentStatus\`,\`CurrentStatus\`,\`MSISDN\`),
  KEY \`grpIdx6\` (\`IMSI\`,\`CurrentStatus\`),
  KEY \`grpIdx7\` (\`IMSI\`,\`PostpaidCurrentStatus\`),
  KEY \`TierId_Idx\` (\`TierId\`),
  KEY \`TimeZone\` (\`TimeZone\`),
  KEY \`CustCode_CounCode_idx\` (\`CustomerCode\`,\`CountryCode\`),
  KEY \`planId\` (\`PlanID\`),
  KEY \`grpIdx8\` (\`ParentEntityId\`,\`CurrentStatus\`,\`PostpaidCurrentStatus\`),
  KEY \`idx_ICCID\` (\`ICCID\`),
  KEY \`idx_EID\` (\`EID\`)
);`,
      dataVolume: `Current Production Load:
• Total Rows: 5920371 rows
• Total Subscribers: 125,340 active subscriptions
• Active Subscribers (CurrentStatus='A'): 108,290 (86%)
• Suspended Subscribers (CurrentStatus='S'): 11,250 (9%)
• Terminated Subscribers (CurrentStatus='T'): 4,890 (4%)
• Pending Activations (CurrentStatus='P'): 910 (1%)

Data Growth Pattern:
• Monthly Growth: ~4,200 new subscribers
• Churn Rate: 2.8% monthly
• Peak Activity: 10 AM - 4 PM weekdays
• Storage Size: 52.8 MB
• Index Size: 18.3 MB

Usage Statistics:
• M2M/IoT Subscribers: 89,240 (71%)
• Traditional Mobile: 36,100 (29%)
• eSIM Enabled Subscribers: 23,450 (19%)
• International Roaming Enabled: 45,670 (36%)
• Last Data Refresh: 2024-12-20 06:00 AM

Performance Metrics:
• Average Query Time: 0.22 seconds
• Most Queried Columns: MSISDN, CurrentStatus, ParentEntityId, TierId
• Complex Join Performance: Optimized with composite indexes`
    },
    {
      name: 'CBS_SUBSCRIBER_ACCOUNT_INFO',
      description: 'Comprehensive subscriber account and billing information with multi-account support',
      createScript: `CREATE TABLE \`CBS_SUBSCRIBER_ACCOUNT_INFO\` (
  \`MSISDN\` bigint DEFAULT NULL,
  \`SubscriberID\` varchar(30) NOT NULL,
  \`PlanID\` varchar(35) DEFAULT NULL,
  \`CurrentStatus\` varchar(3) DEFAULT NULL,
  \`PostpaidCurrentStatus\` varchar(3) DEFAULT NULL,
  \`MvnoId\` bigint NOT NULL,
  \`DefaultLanguage\` int DEFAULT NULL,
  \`PlanEffectiveDate\` datetime DEFAULT NULL,
  \`MAStartDate\` datetime DEFAULT NULL,
  \`MAExpiryDate\` datetime DEFAULT NULL,
  \`MABalance\` decimal(20,9) DEFAULT NULL,
  \`MAActualBalance\` decimal(20,9) DEFAULT NULL,
  \`PostpaidMAStartDate\` datetime DEFAULT NULL,
  \`PostpaidMAExpiryDate\` datetime DEFAULT NULL,
  \`PostpaidMABalance\` varchar(20) DEFAULT NULL,
  \`PostpaidMAActualBalance\` varchar(20) DEFAULT NULL,
  \`Account1BundleId\` varchar(40) DEFAULT NULL,
  \`Account1ID\` bigint DEFAULT NULL,
  \`Account1StartDate\` datetime DEFAULT NULL,
  \`Account1ExpiryDate\` datetime DEFAULT NULL,
  \`Account1GraceDate\` varchar(20) DEFAULT NULL,
  \`Account1Balance\` decimal(20,0) DEFAULT NULL,
  \`Account1ActualBalance\` decimal(20,0) DEFAULT NULL,
  \`Account2BundleId\` varchar(40) DEFAULT NULL,
  \`Account2ID\` bigint DEFAULT NULL,
  \`Account2StartDate\` datetime DEFAULT NULL,
  \`Account2ExpiryDate\` datetime DEFAULT NULL,
  \`Account2GraceDate\` varchar(20) DEFAULT NULL,
  \`Account2Balance\` decimal(20,0) DEFAULT NULL,
  \`Account2ActualBalance\` decimal(20,0) DEFAULT NULL
  -- Additional account fields would continue here
);`,
      dataVolume: `Current Production Load:
• Total Rows: 9945657  rows
• Total Account Records: 85,230 billing accounts
• Active Accounts: 72,190 (85%)
• Suspended Accounts: 8,540 (10%)
• Grace Period: 3,200 (4%)
• Terminated: 1,300 (1%)

Balance Distribution:
• Positive Balance Accounts: 64,580 (76%)
• Zero Balance: 13,420 (16%)
• Negative Balance: 7,230 (8%)
• Average Balance: $45.67

Growth Metrics:
• Monthly New Accounts: 2,800
• Account Closure Rate: 1.2%
• Storage Size: 38.5 MB
• Last Updated: 2024-12-20 11:30 PM`
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setError('Please enter a SQL query');
      return;
    }
    setError('');
    
    const tableStructuresStr = tableStructures.map(table => 
      `${table.name}:\n${table.createScript}`
    ).join('\n\n');
    
    const dataVolumeStr = tableStructures.map(table => 
      `${table.name}:\n${table.dataVolume}`
    ).join('\n\n');
    
    onSQLSubmit(query, tableStructuresStr, dataVolumeStr);
  };

  const toggleTableExpansion = (tableName: string) => {
    setExpandedTable(expandedTable === tableName ? null : tableName);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <Database className="h-6 w-6 text-blue-600" />
            SQL Query Analyzer
          </h2>
          <p className="mt-2 text-gray-600">
            Enter your SQL query to analyze performance and get optimization suggestions
          </p>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="sql-query" className="block text-sm font-medium text-gray-700 mb-2">
                SQL Query
              </label>
              <textarea
                id="sql-query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder="Enter your SQL query here..."
                disabled={loading}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <BarChart3 className="h-4 w-4" />
                  Analyze Query
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Table className="h-5 w-5 text-green-600" />
            Available Tables
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Click on any table to view its structure and data volume information
          </p>
        </div>

        <div className="divide-y divide-gray-100">
          {tableStructures.map((table) => (
            <div key={table.name} className="p-4">
              <button
                onClick={() => toggleTableExpansion(table.name)}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-md transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Table className="h-4 w-4 text-gray-500" />
                  <div>
                    <h4 className="font-medium text-gray-900">{table.name}</h4>
                    <p className="text-sm text-gray-500">{table.description}</p>
                  </div>
                </div>
                {expandedTable === table.name ? (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
              </button>

              {expandedTable === table.name && (
                <div className="mt-4 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Code className="h-4 w-4 text-blue-600" />
                      <h5 className="font-medium text-gray-800">Table Structure</h5>
                    </div>
                    <pre className="bg-gray-50 p-3 rounded-md overflow-x-auto text-xs font-mono text-gray-700 border">
                      {table.createScript}
                    </pre>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="h-4 w-4 text-green-600" />
                      <h5 className="font-medium text-gray-800">Data Volume & Performance</h5>
                    </div>
                    <div className="bg-green-50 p-3 rounded-md">
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                        {table.dataVolume}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};