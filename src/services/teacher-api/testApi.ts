import api from "@/services/apiClient";

export const testApi = {
  async testTeacherEndpoints(teacherId: number) {
    console.log('Testing teacher endpoints for ID:', teacherId);
    
    try {
      // Test existing endpoint
      const classFiltersRes = await api.get(`/api/teachers/${teacherId}/class-filters`);
      console.log('Class filters response:', classFiltersRes.data);
      
      // Test new sections endpoint
      const sectionsRes = await api.get(`/api/teachers/${teacherId}/sections`);
      console.log('Sections response:', sectionsRes.data);
      
      // Test existing classes endpoint
      const classesRes = await api.get(`/api/teachers/${teacherId}/classes`);
      console.log('Classes response:', classesRes.data);
      
      return {
        classFilters: classFiltersRes.data || [],
        sections: sectionsRes.data || [],
        classes: classesRes.data || []
      };
    } catch (error) {
      console.error('Error testing teacher endpoints:', error);
      return {
        classFilters: [],
        sections: [],
        classes: []
      };
    }
  }
};
