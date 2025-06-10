from rest_framework import serializers
from .models import UserInteraction

class UserInteractionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserInteraction
        fields = ['id', 'user', 'car_listing', 'interaction_type', 'interaction_count', 'last_interaction']
        read_only_fields = ['id', 'user', 'interaction_count', 'last_interaction']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        
        # Verificăm dacă interacțiunea există deja
        interaction, created = UserInteraction.objects.get_or_create(
            user=validated_data['user'],
            car_listing=validated_data['car_listing'],
            interaction_type=validated_data['interaction_type'],
            defaults={'interaction_count': 1}
        )
        
        # Dacă interacțiunea există, incrementăm contorul
        if not created:
            interaction.interaction_count += 1
            interaction.save()
        
        return interaction