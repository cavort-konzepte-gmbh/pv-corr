@@ .. @@
               <ButtonSection view={view} match="datapoints" onClick={() => {
                 if (selectedProjectId && selectedFieldId && selectedZoneId) {
                   setView('datapoints');
                 }
               }}>
                 <Database size={18} />
                 <span>{t("nav.datapoints")}</span>
               </ButtonSection>
-              <ButtonSection view={view} match="evaluation" onClick={() => setView('evaluation')}>
+              <ButtonSection view={view} match="analyse" onClick={() => setView('analyse')}>
                 <Database size={18} />
-                <span>{t("nav.evaluation")}</span>
+                <span>{t("nav.analyse")}</span>
               </ButtonSection>
               <ButtonSection view={view} match="output" onClick={() => setView('output')}>
                 <Database size={18} />
@@ .. @@
       case 'datapoints':
         return selectedZone && selectedProject && selectedField ? (
           <Datapoints
             currentTheme={currentTheme}
             currentLanguage={currentLanguage}
             project={projectData}
             field={fieldData}
             selectedZone={selectedZone}
             onBack={() => {
               setView('zones');
               setSelectedZoneId(undefined);
               setSelectedZone(undefined);
             }}
             onProjectsChange={setProjects}
           />
         ) : (
           <div className="p-6 text-center" style={{ color: currentTheme.colors.text.secondary }}>
             {t("datapoint.please_select_zone")}
           </div>
         );
-      case 'evaluation':
+      case 'analyse':
         return (
           <div className="p-6 text-center text-secondary">
-            {t("evaluation.panel_coming_soon")}
+            {t("analyse.panel_coming_soon")}
           </div>
         );